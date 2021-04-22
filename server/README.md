# Server

#### Frameworks: Node.js, Express.js

#### Database: MongoDB + Mongoose

#### Testing: Jest + SuperTest (for endpoints)

## Collections

### Submissions:

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
             [
                 {
                    categoryID: ...,
                    categoryName: "Best Solo Hack",
                 },
                 {
                     categoryID: ...,
                     categoryName: "Best Use of X API"
                 }
             ]
        }
    },
    ...
}
```

### Categories:

```
{
    {
        categoryID: ...,
        categoryName: "Best Beginner Hack",
        companyName: null,
        trackOrSuperlative: "track"
    },
    ...
}
```

### Judges:

```
{
    {
        judgeID: ...,
        judgeName: "Minnie Summer",
        companyName: "Mango DB",
        categoriesToJudge: [
            {
                categoryID: ...,
                categoryName: "Best Use of Mango DB"
            }
        ]
    },
    ...
}
```
