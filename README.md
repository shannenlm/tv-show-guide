# tv-show-guide

---

Names: Iris Hu, Shannen Lam

Date: May 10, 2019

Project Topic: TV Show Guide

URL: --

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`:     Title              `Type: String`
- `Field 2`:     Network            `Type: String`
- `Field 3`:     Actor(s)           `Type: [String]`
- `Field 4`:     Genre(s)           `Type: [String]`
- `Field 5`:     Language           `Type: String`
- `Field 6`:     Avg. Rating        `Type: Number`
- `Field 7`:     Review(s)          `Type: [Review]`
- `Field 8`:     Comment(s)         `Type: [Comment]`

Movie Schema: 
```javascript
{
   title: String, 
   network: String,
   actors: [String],
   genres: [String],
   language: String,
   rating: Number,
   reviews: [Review],  
   comments: [Comment]
}
```

Review Schema: 
```javascript
{
   author: String, 
   publisher: String,
   rating: Number,
   text: String
}
```

Comment Schema: 
```javascript
{
   username: String, 
   text: String
}
```

### 2. Add New Data

HTML form route: `/create`

POST endpoint route: `/api/create`

Example Node.js POST request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/api/create',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
       title: "i'm so tired...", 
       artists:["Lauv","Troye Sivan"],
       genres:["Pop"],
       language:"English",
       suggested: 1,
       rate: 5
    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/getshows`

### 4. Search Data

Search Field: TV Show Title

### 5. Navigation Pages

Navigation Filters
1. By Rating -> `  /byrating  `
2. By Genre -> `  /bygenre  `
3. Alphabetically -> `  /alphabetical  `
4. Most Reviews => `  /mostreviews  `
5. Random Rec -> `  /randomrec  `

