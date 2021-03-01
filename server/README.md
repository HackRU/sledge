# Server

#### Frameworks: Node.js, Express.js

#### Database: MongoDB

Possible Schema Validation options:

- MongoDB Node.js driver
  - No extra packages
- Mongoose
  - apparently has smaller learning curve than stock Node driver
- Joi
  - more lightweight than Mongoose

## Tables

This is how the submissions collection looks:

```
{
    {
        project_id: (equals team id?),
        is_submitted: false/true,
        attributes: {
            title: ...,
            description: ...,
            technologies: ...,
            etc: ...
        },
        submission_contents: {
            urls: [
                {
                    label: "github repo",
                    url: "https://github.com/..."
                 },
                 {
                     label: "website",
                     url: "https://hackruapp.herokuapp.com"
                 }
            ]
             etc: ...
        }
        categories: {
             [I forget how json arrays work]
        }
    },
    {
        project_id: ...;
        ...
    }
}
```
