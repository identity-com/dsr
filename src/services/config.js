const path = require('path');
const os = require('os');
const fs = require('fs');

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (process.platform === 'win32') throw new Error(`Unsupported platform: ${process.platform}`);

if (process.env.APP_ENV !== 'browser' && !isBrowser) {
  const CONFIG_FILE = 'config';

  const CONFIG_PATH = {
    BOX: '/etc/civic',
    USER: path.join(`${os.homedir()}`, '.civic'),
  };

  const userConfigFile = path.join(CONFIG_PATH.USER, CONFIG_FILE);
  const boxConfigFile = path.join(CONFIG_PATH.BOX, CONFIG_FILE);

  const configFile = fs.existsSync(userConfigFile) ? userConfigFile : boxConfigFile;

  /* eslint-disable global-require */
  if (fs.existsSync(userConfigFile)) {
    require('dotenv').config({
      path: configFile,
    });
  }
  /* eslint-ebable global-require */
}

const config = {
  partner: {
    id: process.env.PARTNER_ID,
    signingKeys: {
      xpub: process.env.PARTNER_XPUB,
      xprv: process.env.PARTNER_XPRV,
    },
  },

  app: {
    id: process.env.APP_ID,
    name: process.env.APP_NAME,
    logo: process.env.APP_LOGO_URL,
    description: process.env.APP_DESCRIPTION,
    primaryColor: process.env.APP_PRIMARY_COLOR ? process.env.APP_PRIMARY_COLOR : 'A80B00',
    secondaryColor: process.env.APP_SECONDARY_COLOR ? process.env.APP_SECONDARY_COLOR : 'FFFFFF',
  },
  channels: {
    baseEventsURL: process.env.BASE_EVENT_URL,
    basePayloadURL: process.env.BASE_PAYLOAD_URL,
  },
};

module.exports = config;
