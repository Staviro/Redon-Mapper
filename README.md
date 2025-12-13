# Redon Mapper

Redon Mapper is a lightweight, high-performance utility library for JavaScript designed to solve the perennial problem of normalizing and transforming inconsistent data structures from various RESTful APIs into a single, predictable schema.

## Getting Started

### Installation

- To install Redon Mapper, you only need the redon-mapper.js file found at `/src/lib/redon-mapper.js`
- You will need to do a manual manipulation if you want it to be a normal JS file or a ESM module or commonjs file.
- After adding the file you are free to start normalizing your data!

### Usage

Redon Mapper consists on the many functions but there is only developers need to use, namely `map()`

- `map` accepts 2 params, `source` and `template`, Wher `source` can be either be `Object | Array<Object>` and template is a `Object`.
- Depending on what type you pass as an arguement to `source`, redon-mapper will either call `mapOne` or `mapAll` to handle the mapping and return the relevant response.
- Feel free to check the tests at `src/tests/` to see real life examples.

### Template

A template represents what you want to data to look like after normalization. Templates are crucial for redon-mapper and must configured with the upmost care.

Example templates can be found at `/src/templates/`

- A template is a simple JSON object. The direct keys of template object represent the structure of the JSON.
- A template key object accepts `sourceKeys`. Source Keys represents the potential identities of a specific field you expect a certain response to have.
- `defaultValue` represents what value should be placed when a certain value is null or undefined from the response. This field is optional.
- `transform` represents what the value should be transfromed/converted to should it be found. This simplifies the need to converting every single record from a list of objects.

### Example

```javascript
// Example Usage
import { map } from "redon-mapper";

const sourceData = { user_id: 1, first_name: "Alice", age: 30 };
const template = {
  export const userTemplate = {
  id: {
    sourceKeys: ["id", "_id", "UserId", "_userId", "USER_ID", "ID"],
  },
  username: {
    sourceKeys: ["_username", "USERNAME", "username", "userName", "user"],
    defaultValue: null,
  },
  registeredDate: {
    sourceKeys: [
      "REGISTEREDDate",
      "REGISTEREDDATE",
      "registeredDate",
      "registereddate",
      "registered_date",
    ],
    defaultValue: "1800/01/01",
    transform: (value) => new Date(value),
  },
};

};

const normalizedData = map(sourceData, template);
/* normalizedData:
{
  id: 'a1b2c3d4e5',
  username: 'jdoe_42',
  registeredDate: 2023-11-15T10:30:00.000Z
}
```

## Happy Data Normalization!

Please feel free to leave me any comments or reviews should there be any!
