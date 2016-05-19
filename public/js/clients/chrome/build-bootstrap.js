/* eslint-disable */
"use strict";

const fs = require("fs");
const join = require("path").join;
const protocol = require("./protocol.json");

String.prototype.toTitleCase = function toTitleCase() {
  return this.substring(0, 1).toUpperCase() + this.substring(1);
}


/**
 * @param {*} schema
 * @return {string}
 */
function generateCommands(schema) {
    var jsTypes = { integer: "number", array: "object" };
    var rawTypes = {};
    var result = [];

    var domains = schema["domains"] || [];
    for (var i = 0; i < domains.length; ++i) {
        var domain = domains[i];
        for (var j = 0; domain.types && j < domain.types.length; ++j) {
            var type = domain.types[j];
            rawTypes[domain.domain + "." + type.id] = jsTypes[type.type] || type.type;
        }
    }

    function toUpperCase(groupIndex, group0, group1)
    {
        return [group0, group1][groupIndex].toUpperCase();
    }
    function generateEnum(enumName, items)
    {
        var members = [];
        for (var m = 0; m < items.length; ++m) {
            var value = items[m];
            var name = value.replace(/-(\w)/g, toUpperCase.bind(null, 1)).toTitleCase();
            name = name.replace(/HTML|XML|WML|API/ig, toUpperCase.bind(null, 0));
            members.push(name + ": \"" + value +"\"");
        }
        return "InspectorBackend.registerEnum(\"" + enumName + "\", {" + members.join(", ") + "});";
    }

    for (var i = 0; i < domains.length; ++i) {
        var domain = domains[i];

        var types = domain["types"] || [];
        for (var j = 0; j < types.length; ++j) {
            var type = types[j];
            if ((type["type"] === "string") && type["enum"])
                result.push(generateEnum(domain.domain + "." + type.id, type["enum"]));
            else if (type["type"] === "object") {
                var properties = type["properties"] || [];
                for (var k = 0; k < properties.length; ++k) {
                    var property = properties[k];
                    if ((property["type"] === "string") && property["enum"])
                        result.push(generateEnum(domain.domain + "." + type.id + property["name"].toTitleCase(), property["enum"]));
                }
            }
        }

        var commands = domain["commands"] || [];
        for (var j = 0; j < commands.length; ++j) {
            var command = commands[j];
            var parameters = command["parameters"];
            var paramsText = [];
            for (var k = 0; parameters && k < parameters.length; ++k) {
                var parameter = parameters[k];

                var type;
                if (parameter.type)
                    type = jsTypes[parameter.type] || parameter.type;
                else {
                    var ref = parameter["$ref"];
                    if (ref.indexOf(".") !== -1)
                        type = rawTypes[ref];
                    else
                        type = rawTypes[domain.domain + "." + ref];
                }

                var text = "{\"name\": \"" + parameter.name + "\", \"type\": \"" + type + "\", \"optional\": " + (parameter.optional ? "true" : "false") + "}";
                paramsText.push(text);
            }

            var returnsText = [];
            var returns = command["returns"] || [];
            for (var k = 0; k < returns.length; ++k) {
                var parameter = returns[k];
                returnsText.push("\"" + parameter.name + "\"");
            }
            var hasErrorData = String(Boolean(command.error));
            result.push("InspectorBackend.registerCommand(\"" + domain.domain + "." + command.name + "\", [" + paramsText.join(", ") + "], [" + returnsText.join(", ") + "], " + hasErrorData + ");");
        }

        for (var j = 0; domain.events && j < domain.events.length; ++j) {
            var event = domain.events[j];
            var paramsText = [];
            for (var k = 0; event.parameters && k < event.parameters.length; ++k) {
                var parameter = event.parameters[k];
                paramsText.push("\"" + parameter.name + "\"");
            }
            result.push("InspectorBackend.registerEvent(\"" + domain.domain + "." + event.name + "\", [" + paramsText.join(", ") + "]);");
        }
    }
    return result.join("\n");
}

// generate InspectorBackend commands / events
// e.g. InspectorBackend.registerCommand("Inspector.enable", [], [], false);
const code = generateCommands(protocol);

// wrap the commands in a function that receives InspectorBackend
const bootstrapFunction = new Function("InspectorBackend", code);

// export a module with that function
const moduleText = `/* eslint-disable */\nmodule.exports = ${bootstrapFunction}`

fs.writeFile(
  join(__dirname,'bootstrap.js'),
  moduleText
);
