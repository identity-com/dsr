/**
 * Services IoC modules
 */
const Bottle = require('bottlejs');
const config = require('./config');
const logger = require('../logger');

const signer = require('./signer');

const services = new Bottle();

/**
 * Init services with new values to config and http services
 * @param {*} conf
 */
const initServices = (conf) => {
  if (conf) {
    services.resetProviders(['Http', 'Config']);
    logger.debug('Registering custom Config service implementation');
    services.factory('Config', () => conf);
  }

  return services;
};

/**
 * Return configuration, only doing this to cover on tests, inner arrow functions are untestable
 */
const getConfig = () => config;

services.factory('Config', getConfig);

/**
 * Return signer, only doing this to cover on tests, inner arrow functions are untestable
 */
const getSigner = () => signer;
services.factory('Signer', getSigner);

module.exports = { services, initServices, getConfig };
