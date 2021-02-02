const sift = require('sift').default;
const { definitions: ucaDefinitions } = require('@identity.com/uca');

/**
 * Dynamic Scope Request resolver. Do the filtering of credentials by passing unresolved scope requests
 *
 * @returns {*}
 * @constructor
 */
function DsrResolver() {
  this.convertMongoOperatorToJavascript = ((operator) => {
    if (operator === '$gt') {
      return '>';
    }
    if (operator === '$gte') {
      return '>=';
    }
    if (operator === '$lt') {
      return '<';
    }
    if (operator === '$lte') {
      return '<=';
    }
    return null;
  });

  /**
   *
   * Resolve the set of required user data for verification
   *
   * @param scope the scope request and it's criteria for selection
   * @param credentials a list of user credentials for filtering
   */
  this.filterCredentials = (scope, credentials) => {
    const filtered = [];
    scope.credentialItems.forEach((credentialItem) => {
      // the path of the scope is an multi value array it can be either an string (direct GLOBAL identifier) or an object with
      // the identifier, we need to check on the type array of an VC if the type of the global identifier matches
      const globalIdentifier = typeof credentialItem === 'string' ? credentialItem : credentialItem.identifier;
      // the type of the VC eg civ:Type:address or cvc:Identity:name
      const globalIdentifierType = globalIdentifier.substring(0, globalIdentifier.indexOf('-'));

      // for credentials we filter out the credentials, the meta issuer than the claim path
      if (globalIdentifierType === 'credential') {
        const type = globalIdentifier.substring('credential-'.length, globalIdentifier.lastIndexOf('-'));
        // filter the VCs, do not confuse this $eq with the operator $eq on credentialItems array
        const tempFiltered = credentials.filter(sift({ identifier: { $regex: `${type}` } }));

        // if there is an constraint on the credential
        if (credentialItem.identifier) {
          const filterArgArray = [];
          // filtering meta constraints if they exist
          if (credentialItem.constraints.meta) {
            if (credentialItem.constraints.meta.issued) {
              // there is only one key
              const operatorIssued = Object.keys(credentialItem.constraints.meta.issued.is)[0];
              const convertedOperatorIssued = this.convertMongoOperatorToJavascript(Object.keys(credentialItem.constraints.meta.issued.is)[0]);
              const claimConstraintIssued = credentialItem.constraints.meta.issued.is[operatorIssued];
              const claimFilterIssued = {};
              claimFilterIssued.$where = `new Date(this.issued).getTime() ${convertedOperatorIssued} ${claimConstraintIssued}`;
              filterArgArray.push(claimFilterIssued);
            }
            if (credentialItem.constraints.meta.expiry) {
              // there is only one key
              const operatorExpiry = Object.keys(credentialItem.constraints.meta.expiry.is)[0];
              const convertedOperatorExpiry = this.convertMongoOperatorToJavascript(Object.keys(credentialItem.constraints.meta.expiry.is)[0]);
              const claimConstraintExpiry = credentialItem.constraints.meta.expiry.is[operatorExpiry];
              const claimFilterExpiry = {};
              claimFilterExpiry.$where = `new Date(this.expiry).getTime() ${convertedOperatorExpiry} ${claimConstraintExpiry}`;
              filterArgArray.push(claimFilterExpiry);
            }
            if (credentialItem.constraints.meta.issuer) {
              const claimPathIssuer = 'issuer';
              // there is only one key
              const operatorIssuer = Object.keys(credentialItem.constraints.meta.issuer.is)[0];
              const claimConstraintIssuer = credentialItem.constraints.meta.issuer.is[operatorIssuer];
              const claimFilterIssuer = {};
              claimFilterIssuer[claimPathIssuer] = claimConstraintIssuer;
              filterArgArray.push(claimFilterIssuer);
            }
          }

          // this is the structure on the dsr { "path": "claim.path", "is": {"operator": "valueToFilter"} },
          // for each constraint, we have to filter out the credentials
          if (credentialItem.constraints && credentialItem.constraints.claims) {
            credentialItem.constraints.claims.forEach((claim) => {
              const claimPath = `claim.${claim.path}`;
              // there is only one key
              const operator = Object.keys(claim.is)[0];
              const claimConstraint = claim.is[operator];
              const claimFilter = {};
              claimFilter[claimPath] = claimConstraint;
              filterArgArray.push(claimFilter);
            });
          }
          // with all the filters, do one query
          const filterArg = { $and: filterArgArray };
          filtered.push(...tempFiltered.filter(sift(filterArg)));
        } else {
          filtered.push(...tempFiltered);
        }
      } else if (globalIdentifierType === 'claim') {
        // for UCAs it can either be a type, or an alsoKnown as
        const type = globalIdentifier.substring('claim-'.length, globalIdentifier.lastIndexOf('-'));
        const definition = ucaDefinitions.find(def => def.identifier === type);
        const tempFiltered = [];
        const filterArgArray = [];

        // if the definition has alsoKnown, the identifier and the path we should be looking is the aka
        if (definition.alsoKnown) {
          definition.alsoKnown.forEach((identifier) => {
            const ucaType = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':')).toLowerCase();
            const propertyPath = identifier.substring(identifier.lastIndexOf(':') + 1);
            const claimFilter = {};
            // if it is a directly global identifier, return any VC that the claim path has this property
            claimFilter[`claim.${ucaType}.${propertyPath}`] = { $exists: true };
            tempFiltered.push(...credentials.filter(sift(claimFilter)));
          });
        } else {
          const { identifier } = definition;
          const ucaType = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':')).toLowerCase();
          const propertyPath = identifier.substring(identifier.lastIndexOf(':') + 1);
          const claimFilter = {};
          // if it is a directly global identifier, return any VC that the claim path has this property
          claimFilter[`claim.${ucaType}.${propertyPath}`] = { $exists: true };
          tempFiltered.push(...credentials.filter(sift(claimFilter)));
        }

        // if we are not a simple string
        if (credentialItem.identifier) {
          const ucaType = credentialItem.identifier.substring(credentialItem.identifier.indexOf(':') + 1, credentialItem.identifier.lastIndexOf(':')).toLowerCase();
          // iterate all over our credentials
          if (credentialItem.constraints && credentialItem.constraints.claims) {
            credentialItem.constraints.claims.forEach((claim) => {
              const claimPath = `claim.${ucaType}.${claim.path}`;
              // there is only one key
              const operator = Object.keys(claim.is)[0];
              const claimConstraint = claim.is[operator];
              const constraintFilter = {};
              constraintFilter[claimPath] = claimConstraint;
              filterArgArray.push(constraintFilter);
            });
          }
          const filterArg = { $and: filterArgArray };
          filtered.push(...tempFiltered.filter(sift(filterArg)));
        } else {
          filtered.push(...tempFiltered);
        }
      }
    });
    return filtered;
  };
  return this;
}

module.exports = DsrResolver;
