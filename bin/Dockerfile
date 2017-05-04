FROM ubuntu:trusty

# Install Firefox build dependencies.
# Packages are from https://dxr.mozilla.org/mozilla-central/source/python/mozboot/mozboot/debian.py
RUN sudo apt-get update -q \
 && sudo apt-get upgrade -qy \
 && sudo apt-get install -qy \
  autoconf2.13 \
  build-essential \
  ccache \
  python-dev \
  python-pip \
  python-setuptools \
  unzip \
  uuid \
  zip \
  libasound2-dev \
  libcurl4-openssl-dev \
  libdbus-1-dev \
  libdbus-glib-1-dev \
  libgconf2-dev \
  libgtk-3-dev \
  libgtk2.0-dev \
  libiw-dev \
  libnotify-dev \
  libpulse-dev \
  libx11-xcb-dev \
  libxt-dev \
  mesa-common-dev \
  python-dbus \
  xvfb \
  wget \
  yasm \
  git \
  curl \
  apt-transport-https \
  ocaml \
  libelf-dev \
  python-software-properties


RUN wget -O bootstrap.py https://hg.mozilla.org/mozilla-central/raw-file/default/python/mozboot/bin/bootstrap.py && python bootstrap.py --no-interactive --application-choice=browser

# Install Yarn (will install node as a dependency)
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && sudo apt-get install yarn -y

RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
RUN apt-get install -qy nodejs

# Pull down m-c and add a simple mozconfig
# We'll be able to update the m-c repo at runtime
RUN hg clone https://hg.mozilla.org/integration/mozilla-inbound
RUN touch ./mozilla-inbound/.mozconfig \
  && echo "ac_add_options --enable-artifact-builds" >> ./mozilla-inbound/.mozconfig \
  && echo "mk_add_options MOZ_OBJDIR=./objdir-frontend" >> ./mozilla-inbound/.mozconfig \
  && chmod +x ./mozilla-inbound/.mozconfig
