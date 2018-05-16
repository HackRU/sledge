import path         from "path";
import jsonschema   from "jsonschema";

let validator = new jsonschema.Validator();

export function validate(name, instance) {
    let p = path.resolve(__dirname, "./schemas", name + ".json");
    let schema = require(p);
    return validator.validate(instance, schema).errors;
}
