# Contribute in the development

The main objective of the project is to **develop the EGM app**.

The app will be available through the major browsers and, possibly, published on Apple AppStore and Google Play Store.

## Architecture overview

### Basics

The project's architecture identifies two modular blocks: [**front-end** and **back-end**](https://www.indeed.com/career-advice/career-development/front-end-vs-back-end).

We will focus on the front-end, since the back-end is already defined, based on what we need.

### Languages

The front-end's source code will be written with **web languages**; therefore, it's necessary to have basics in:

- [HTML](https://www.w3schools.com/html/): handles the structure of our pages.
- [CSS](https://www.w3schools.com/css/): holds the presentation (style) of our pages.
- [JavaScript](https://www.w3schools.com/js/): handles the business logic of our pages.

Quick example:

<img alt="web languages" src="https://user-images.githubusercontent.com/3777036/147551619-f65cebb7-91a8-4e21-8b75-bd246f1c0847.png" width="800">

Since we will practice [web development](https://www.freecodecamp.org/news/html-css-and-javascript-explained-for-beginners/), we will end up **creating a [web app](https://medium.com/@essentialdesign/website-vs-web-app-whats-the-difference-e499b18b60b4)**; specifically, it will be a [SPA (Single-Page Application)](https://www.bloomreach.com/en/blog/2018/07/what-is-a-single-page-application.html).

To be precise, to handle the business logic of our app we won't be using JavaScript directly, rather a "superset" of it named **[TypeScript](https://www.typescriptlang.org)**; in a few words, it's basically [JavaScript with syntax for types](https://www.typescriptlang.org/why-create-typescript). _Therefore, if you know JavaScript, you won't have any problem; also: if you know PHP, you will find more similarities._

If you need it, online, you will find tons of free resources, tutorials and crash courses on these languages.

### Frameworks

Of course, we won't be reinventing the wheel and write code from scratch; we will instead take advantage of frameworks. Specifically (for what we've learnt by the team's skills assessment), we will use:

- **[React](https://reactjs.org): a TypeScript (JavaScript) library for building user interfaces**. If you, like me, have never used React before, I suggest watching [this crash course](https://www.youtube.com/watch?v=w7ejDZ8SWv8) and [reading the official (well made) documentation](https://reactjs.org/docs/hello-world.html): they give me enough information to get it started!
- **[Ionic](https://ionicframework.com): a library of mobile-optimized UI components, gestures and tools**. Using Ionic is very easy: you can explore the [components library](https://ionicframework.com/docs/components) and mostly copy/paste the "blocks" that you need.

Here's an example of how the two frameworks affect the graphic result of our programming:

<img width="1000" alt="frameworks" src="https://user-images.githubusercontent.com/3777036/147554832-c214dcaa-df03-49ef-8b4d-b06fc8ae428e.png">

#### Capacitor

I don't want to open more parenthesis on the frameworks (we won't need it right away), but (FYI) [Capacitor](https://capacitorjs.com) is the tool to help us automatically "convert" our web app into a fully-functional native app — ready to be deployed on the mobile stores.

_We will get to this later on!_

## Project structure

Here's the initial project folders/files structure:

<img width="300" alt="initial project structure" src="https://user-images.githubusercontent.com/3777036/147560410-80d57347-0074-4c0b-93c4-c482635792fa.png">

_Don't worry: you won't need to know or edit most of this stuff!_

You will spend 90% of your time working on the `src/components` and `src/pages` folders:

- Pages: are the pages accessible in the app by a particular link (e.g. `/profile`).
- Components: are the building blocks that compose a page (e.g. `<ProfileAvatar />`).

Each component/page is represented by a `.tsx` file (containing structure and business logic, i.e. HTML and TypeScript); sometimes, you may also find a `.css` file (containing the presentation code, i.e. CSS).

## Developer tools and first steps

### Make sure you

- Have installed [Slack](https://slack.com): our communication platform.
- Have installed [Git](https://git-scm.com): for code versioning.
- Have an account on [GitHub](https://github.com): where our code repository and issues (User Stories) are.
- Have installed [Visual Studio Code](https://code.visualstudio.com): the IDE (Integrated Development Environment) that we use to write code. _Not mandatory_ — you can use the tool you prefer — but suggested, since it has some extensions that will help in your job.
- Have installed [Node.js](https://nodejs.org/en/download/): we need to access the [NPM (Node Package Manager)](https://docs.npmjs.com/about-npm) to install all the libraries and dependencies of our source code.
- If you use [Google Chrome](https://www.google.com/chrome/), you can install the [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension to access some specific React debug features.

You probably have most of this stuff already on your dev computer, but if you need help in installing or configuring any tools, let me know!

### Next steps

- **Get confident with the main languages (HTML, CSS, TypeScript) and frameworks (React, Ionic)** by reading some documentation and following any tutorial or course (you can find plenty of them for free online). _If you have any questions, I'm here to help!_ 😄
- **Explore the repository on GitHub** to peek at the base source code and get to know the User Stories (Issues) that express the features that we will implement.
- **Clone the repository locally** to have the source code ready on your computer. [Read more about cloning a repository from GitHub](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/adding-and-cloning-repositories/cloning-a-repository-from-github-to-github-desktop).
- **Start experimenting** by running the local environment (localhost) and changing the code to your likings. See below for further instructions.

### Starting the local environment

Make sure you have installed the projec's latest libraries and dependencies by running (project's root):

```
npm install
```

Start the project locally by running:

```
npm start
```

or from Visual Studio Code: `Run > Start debugging` or press `F5` (`Fn+F5` in some computers).

This will start a local development environment that can be accessed (once it finishes loading) with any browser (Google Chrome is suggested) at the address: `http://localhost:3000`.

Any change that you make to the code will be automatically reloaded in the browser (you should see changes almost instantly).

If you want to debug your code, you can open the [Developer Tools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools) of your browser.

### Tackle an issue, develop and commit changes

_When you're ready to try tackling a User Story, let me know!_ 💪

You will be assigned to the related Issue on GitHub, and [you will start working on a new branch](https://emily-ha-35637.medium.com/how-and-why-to-use-a-feature-branch-in-github-48a9b23b7348).

You will **implement in your local code the changes that make the new feature work**. It's always a good practice to carefully test the code that we implement!

When we are confident with the results, we can **commit our changes and create a Pull Request** to merge the changes in the main branch.

We will **discuss together** whether we can fix any problem or improve the code; finally, we will merge the changes and publish the new feature in the app.

Oh, [here you can find some best pratices](https://iter-idea.notion.site/Git-conventions-7f411b668d984eb3a05a03dfcae25d6f) about managing/committing/reviewing our code: it would be nice to follow them. 😉
