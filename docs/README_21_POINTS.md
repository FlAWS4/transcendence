# ft_transcendence — 21 Subject Points Explained

This guide is based on the **ft_transcendence subject v21.2**.

It is written for team members who may still have limited knowledge of frontend, backend, databases, Docker, security, real-time systems, or Three.js.

For every point, the guide explains:
- what the subject asks for;
- what it means in simple words;
- what the team should build or verify;
- when we can consider the point finished.

## Important

- **Points 1 to 15** mainly cover the mandatory project foundation.
- **Point 16** explains the mandatory module-score rule.
- **Points 17 to 21** are relevant subject modules for our project. These individual modules are only required if the team decides to claim them.
- A claimed module only gives points when all of its required parts work.
- The subject requires at least **14 module points in total**.

---

# 1. Define the team roles clearly

**Subject reference:** Chapter II.1.1 — Required Team Roles — pages 4–5.

The subject requires clear roles and responsibilities from the beginning.

For a five-person team, the subject identifies:
- Product Owner;
- Project Manager / Scrum Master;
- Technical Lead / Architect;
- Developers.

The Product Owner decides product direction and priorities.

The Project Manager follows planning, progress, deadlines, communication, risks, and blockers.

The Technical Lead decides and reviews important technical choices and architecture.

All team members are also developers and should implement, test, review, and document real work.

## What the team should do

Write the roles in the main project README.

For every member, document:
- name and 42 login;
- assigned role;
- main responsibilities;
- actual features or modules implemented.

Do not invent contributions before the work exists.

## Done when

Every member can clearly explain:
- their role;
- what they personally worked on;
- what they reviewed;
- how their work connects to the rest of the application.

---

# 2. Create a complete project README

**Subject reference:** Chapter III.1 — page 7, and Chapter VI — README Requirements — pages 27–29.

The README is not just a small description.

The subject treats it as an important evaluation document and requires it to be written in English.

## What the README should contain

At minimum, document:
- project description;
- installation instructions;
- how to run the project;
- team members and roles;
- project-management method;
- technical stack;
- database schema;
- implemented features;
- selected modules;
- module point calculation;
- which members worked on each feature/module;
- individual contributions;
- important challenges and solutions.

## Simple idea

A person who has never seen the project should be able to answer:

~~~text
What is this project?
How do I run it?
What technologies does it use?
How is the database organized?
Which features exist?
Which modules are claimed?
Who did what?
~~~

## Done when

A new developer can clone the repository, follow the README, start the application, and understand the main structure without needing missing verbal instructions.

---

# 3. Build a real frontend, backend, and database

**Subject reference:** Chapter III.2 — General Requirements — page 8.

The subject requires a complete web application with:
- frontend;
- backend;
- database.

A static design or prototype alone is not enough.

## Frontend

The frontend is what users see and interact with.

Examples:
- register/login forms;
- profile pages;
- project pages;
- globe;
- search;
- chat interface.

## Backend

The backend handles logic and protected operations.

Examples:
- registration/login;
- permissions;
- project creation;
- campus data;
- search;
- chat messages.

## Database

The database stores persistent information.

Examples:
- users;
- profiles;
- projects;
- campuses;
- friends;
- conversations;
- messages.

## Basic flow

~~~text
User action
    |
    v
Frontend
    |
HTTP request
    |
    v
Backend
    |
    v
Database
    |
    v
Backend response
    |
    v
Frontend updates
~~~

## Done when

The important user journeys use the real frontend, backend, and database together.

---

# 4. Use Git correctly and show real team contributions

**Subject reference:** Chapter III.2 — General Requirements — page 8.

The repository must show:
- commits from all members;
- meaningful commit messages;
- proper work distribution.

Git history is evidence of how the project was actually developed.

## Good commit examples

~~~text
add campus API
add profile validation
fix chat reconnect
add project search filters
~~~

## Bad commit examples

~~~text
stuff
update
fix
final
working
~~~

## What the team should do

Each member should commit their own real work.

Keep commits reasonably focused.

Avoid one person committing everything for everyone.

## Done when

The Git history makes it easy to understand:
- who contributed;
- what they changed;
- how the project evolved.

---

# 5. Run the application with containers and one command

**Subject reference:** Chapter III.2 — General Requirements — page 8.

The subject requires a containerization solution such as:
- Docker;
- Podman;
- an equivalent solution.

The application must run with one documented command.

## Practical example

A final workflow may look like:

~~~bash
docker compose up --build
~~~

Possible services:

~~~text
Docker Compose
   |
   +-- frontend
   +-- backend
   +-- database
   +-- reverse proxy
~~~

The exact architecture can be different, but the complete project should be reproducible.

## Important test

The person who writes the Docker setup should not be the only person who can run it.

Another team member should clone the repository and follow only the documentation.

## Done when

The full application starts on a clean machine by following the documented container command.

---

# 6. Support the latest stable Chrome and keep the console clean

**Subject reference:** Chapter III.2 — General Requirements — page 8.

The subject requires compatibility with the latest stable version of Google Chrome.

It also says there should be no JavaScript warnings or errors in the browser console.

## What to test

Open Chrome DevTools while testing:
- registration;
- login;
- profile;
- project creation;
- globe;
- search;
- chat;
- logout.

## Problems that should not be ignored

Examples:

~~~text
Uncaught TypeError
Unhandled Promise Rejection
Failed to fetch
React warnings
broken asset requests
JavaScript exceptions
~~~

The page looking correct is not enough if the console shows broken behavior.

## Done when

The normal evaluation journeys work in current stable Chrome without JavaScript warnings or errors.

---

# 7. Add real Privacy Policy and Terms of Service pages

**Subject reference:** Chapter III.2 — General Requirements — page 8.

Both pages are mandatory.

The subject says they must:
- be easy to access;
- contain relevant content;
- not be empty;
- not be placeholders.

The subject also warns that missing or inadequate legal pages can cause project rejection.

## What the team should do

Create visible pages such as:

~~~text
/privacy
/terms
~~~

Link them from the application, for example from the footer.

The content should match the real project.

For Horizon, useful topics may include:
- account information;
- uploaded projects;
- avatars/media;
- messages;
- user responsibilities;
- data deletion;
- privacy.

## Done when

Both pages are reachable from the real application and contain project-specific text.

---

# 8. Support multiple users at the same time

**Subject reference:** Chapter III.2 — Multi-user Support — page 8.

This is a mandatory core requirement.

The application must work when several users are active at once.

## What this means

Different users should be able to:
- stay logged in at the same time;
- perform actions at the same time;
- receive real-time updates when relevant;
- use shared data without corrupting it.

## Example

~~~text
User A                  User B

logs in                 logs in
   |                       |
creates comment        sends message
   |                       |
   +------ backend --------+
              |
              v
           database
~~~

User A must not accidentally receive User B's session or private data.

## How to test

Use:
- two browsers;
- normal + private/incognito window;
- two computers when possible.

Use two different accounts.

## Done when

Concurrent activity does not create:
- session conflicts;
- duplicated or corrupted records;
- race-condition bugs;
- wrong real-time recipients.

---

# 9. Build a responsive and accessible frontend with an organized styling solution

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

The subject requires a frontend that is:
- clear;
- responsive;
- accessible across devices.

It also requires a CSS framework or styling solution.

Examples in the subject include:
- Tailwind CSS;
- Bootstrap;
- Material UI;
- Styled Components.

## Responsive means

The interface should adapt to different sizes.

Test:
- desktop;
- laptop;
- tablet-sized viewport;
- phone-sized viewport.

Users should not need to zoom out just to use the application.

## Basic accessibility

Even if the team does not claim the full WCAG module, normal accessibility still matters.

Examples:
- buttons usable by keyboard;
- readable text;
- labels for form fields;
- visible focus;
- meaningful names;
- usable touch targets;
- do not rely only on color.

## Done when

Important pages work on desktop and mobile with a consistent styling system.

---

# 10. Protect secrets with .env and provide .env.example

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

Secrets must not be committed directly to Git.

The subject requires:
- a local .env file;
- .env ignored by Git;
- an .env.example file committed to the repository.

## Example

Real local file:

~~~text
.env
~~~

may contain:

~~~text
DATABASE_PASSWORD=real-secret
JWT_SECRET=real-secret
API_KEY=real-secret
~~~

The repository should contain a safe example:

~~~text
.env.example
~~~

Example values:

~~~text
DATABASE_PASSWORD=change-me
JWT_SECRET=change-me
API_KEY=change-me
~~~

## Never commit

- real passwords;
- access tokens;
- API secrets;
- private keys.

## Done when

A new developer knows which variables are needed without any real secret being stored in Git.

---

# 11. Create a clear database schema and relations

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

The subject requires a clear schema with well-defined relations.

The database should be designed, not created randomly as features appear.

## Possible Horizon entities

Examples only:

~~~text
User
Profile
Country
Campus
Project
Media
Friendship
Conversation
Message
~~~

Possible relations:

~~~text
Country
   |
   +-- many Campuses

User
   |
   +-- one Profile
   |
   +-- many Projects

Conversation
   |
   +-- many Messages
~~~

The exact schema must be agreed by the team.

## For every table/entity understand

- purpose;
- primary key;
- main fields;
- foreign keys;
- unique rules;
- relations;
- delete/update behavior.

## Done when

The team can show the database structure and explain how the main entities connect.

---

# 12. Implement secure registration and login

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

Basic user management is mandatory.

At minimum, users must be able to:
- sign up;
- log in;
- use email/password authentication.

The subject requires proper password security with hashing and salting.

## Never store

~~~text
password = mypassword123
~~~

directly in the database.

## Correct idea

~~~text
password
   |
   v
secure password hashing
   |
   v
password hash
   |
   v
database
~~~

During login, the backend verifies the entered password against the stored hash.

## Cases to handle

- valid registration;
- duplicate email;
- invalid data;
- correct login;
- incorrect password;
- logout.

## Done when

Users can register and log in securely and plaintext passwords never appear in the database.

---

# 13. Validate all user input in frontend and backend

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

The subject explicitly requires validation in both frontend and backend.

Frontend validation helps users.

Backend validation protects the application.

## Example

~~~text
Registration form

Frontend:
checks fields

       |
       v

Backend:
checks everything again
       |
       v
database
~~~

Never trust the frontend alone.

A user can call the backend without using the website.

## Validate more than forms

Also validate:
- URL parameters;
- IDs;
- search filters;
- uploaded files;
- query parameters;
- WebSocket data where relevant.

## Done when

Bad input is safely rejected even when requests are sent directly to the backend.

---

# 14. Use HTTPS for all browser-to-backend communication

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

Any connection to the backend from:
- browser;
- script;
- external API;

must use HTTPS.

The subject allows internal backend communication to be unencrypted inside the private backend/container network.

## Simple architecture

~~~text
Browser
   |
 HTTPS / WSS
   |
   v
Reverse proxy
   |
   +--> frontend
   |
   +--> backend
            |
      internal network
            |
            v
         database
~~~

If WebSockets are used from the browser, the secured form is WSS.

## Done when

The browser does not directly use insecure HTTP to communicate with the final backend setup.

---

# 15. Understand the framework definition from the subject

**Subject reference:** Chapter III.3 — Technical Requirements — page 9.

The subject gives a specific definition of a framework for this project.

Examples considered frontend frameworks:
- React;
- Vue;
- Angular;
- Svelte;
- Next.js.

Examples considered backend frameworks:
- Express;
- Fastify;
- NestJS;
- Django;
- Flask;
- Ruby on Rails.

The subject explicitly says React counts as a framework in this project context.

Libraries such as Axios or Lodash do not count as frameworks.

## Why this matters

If the team wants framework module points, it must choose technologies that meet the subject's framework definition.

## Done when

The team knows which technologies count as frameworks and can justify the chosen stack.

---

# 16. Reach at least 14 module points

**Subject reference:** Chapter IV — Modules — pages 10–11.

The subject requires at least 14 module points.

Scoring:

~~~text
Major = 2 points
Minor = 1 point
~~~

Incomplete modules give zero points.

## Important rule

Do not count a module just because part of it exists.

If the module requires:

~~~text
A
B
C
~~~

then all required parts must be implemented and demonstrable.

## What the team should create

Maintain a module checklist:

~~~text
Module name
Major / Minor
Points
Exact subject requirements
Status
People working on it
How to demonstrate it
~~~

The subject also suggests aiming above 14 points because one failed module can reduce the validated total.

## Done when

The team has at least 14 fully working and demonstrable module points.

---

# 17. Frameworks on both frontend and backend module

**Subject reference:** Chapter IV.1 — Web — page 12.

This is a **Major module worth 2 points** if selected.

The subject requires:
- a frontend framework;
- a backend framework.

Example combination:

~~~text
React
+
NestJS
~~~

Both must genuinely be used in the production application.

Installing a framework package without using its structure is not enough.

## Frontend framework work may include

- components;
- routes;
- state;
- pages;
- forms;
- UI interaction.

## Backend framework work may include

- controllers/routes;
- services;
- validation;
- authentication;
- API structure.

## Done when

Both frameworks are clearly used for real application features and the team can explain their role.

---

# 18. Real-time features module

**Subject reference:** Chapter IV.1 — Web — page 12.

This is a **Major module worth 2 points** if selected.

The subject requires:
- real-time updates across clients;
- graceful connection/disconnection handling;
- efficient broadcasting.

WebSockets are a common solution.

## Example

~~~text
User A
   |
 sends message
   |
   v
Backend
   |
WebSocket event
   |
   v
User B sees update immediately
~~~

Possible Horizon uses:
- chat;
- online presence;
- notifications;
- live updates.

## Do not test only the happy path

Test:
- connection;
- disconnect;
- reconnect;
- network failure;
- unauthorized subscription;
- duplicate event handling.

## Done when

Multiple connected clients receive the correct live updates and reconnection/disconnection behavior is stable.

---

# 19. User interaction module: chat, profiles, and friends

**Subject reference:** Chapter IV.1 — Web — page 12.

This is a **Major module worth 2 points** if selected.

The subject requires all three:
1. basic chat;
2. profile system;
3. friends system.

## Basic chat

Users can send and receive messages.

## Profile system

Users can view information about other users.

## Friends system

Users can:
- add friends;
- remove friends;
- see their friends list.

## Important

Chat alone does not complete the module.

Profiles alone do not complete the module.

All listed minimum requirements must work.

## Done when

Two accounts can:

~~~text
view profiles
add/remove friendship
send/receive messages
~~~

using real application data.

---

# 20. Standard user management and advanced permissions

**Subject reference:** Chapter IV.3 — User Management — page 14.

These are two separate **Major modules worth 2 points each** if selected.

They are grouped in this guide because both concern users and roles, but they must be counted separately during module planning.

## A. Standard user management

The subject requires:
- profile information can be updated;
- avatar upload;
- default avatar;
- friends;
- online status;
- profile page.

A full flow could be:

~~~text
Register
   |
   v
Profile
   |
   +--> edit information
   +--> upload avatar
   +--> add friend
   +--> see online status
~~~

## B. Advanced permissions

The subject requires:
- view/edit/delete users;
- role management;
- different actions and views based on roles.

Example roles:
- admin;
- user;
- guest;
- moderator.

## Security rule

Frontend hiding is not enough.

Wrong:

~~~text
Hide admin button
but backend still allows the request
~~~

Correct:

~~~text
Frontend controls what user sees
        +
Backend verifies permissions
~~~

## Done when

For standard user management, every listed profile/avatar/friend/status requirement works.

For advanced permissions, role-based actions work and unauthorized backend actions are rejected.

---

# 21. Advanced 3D graphics module for the globe

**Subject reference:** Chapter IV.6 — Gaming and User Experience — page 17.

This is a **Major module worth 2 points** if selected.

The subject allows a library such as:
- Three.js;
- Babylon.js.

It requires:
- an immersive 3D environment;
- advanced rendering techniques;
- smooth performance;
- good user interaction.

## Important warning

A simple rotating sphere with a few dots should not automatically be considered enough.

The globe needs real technical depth if we want to claim this module.

## Possible globe structure

~~~text
Three.js Scene
    |
    +-- Earth sphere generated by code
    +-- geographic/country lines
    +-- campus markers
    +-- lights
    +-- atmosphere/effects when useful
    +-- camera
    +-- interaction
~~~

## Campus positioning

Campus data begins as:

~~~text
latitude
longitude
~~~

The frontend converts it to:

~~~text
x
y
z
~~~

so Three.js can place each campus on the sphere.

## Interaction work

Possible expected behavior:
- mouse rotation;
- touch rotation;
- zoom;
- click/tap campus;
- campus selection;
- smooth camera movement;
- resize handling;
- mobile support.

## Rendering work

Possible technical work:
- SphereGeometry generated in code;
- geographic lines built from coordinate data;
- InstancedMesh for campus markers;
- lighting/material work;
- camera animation;
- visibility handling;
- atmosphere/shader effect if justified;
- controlled render loop;
- cleanup of GPU resources.

## Performance

The subject explicitly asks for smooth performance.

Measure and control:
- frame time;
- device pixel ratio;
- number of rendered objects;
- geographic data size;
- unnecessary animation;
- memory/resource cleanup.

Test on:
- desktop;
- a real phone.

## Fallback

The globe should not be the only way to access campus information.

A normal search/list can provide an alternative.

## Done when

The globe is:

~~~text
genuine 3D work
+
interactive
+
smooth
+
integrated into the real app
+
technically explainable
~~~

and the team can demonstrate the advanced 3D behavior during evaluation.

---

# Final mandatory checklist

Before evaluation, check:

- [ ] Team roles are documented.
- [ ] README is complete and written in English.
- [ ] Real frontend exists.
- [ ] Real backend exists.
- [ ] Real database exists.
- [ ] Git shows contributions from all members.
- [ ] Project starts with the documented container command.
- [ ] Latest stable Chrome works.
- [ ] Normal use has no JavaScript console warnings/errors.
- [ ] Privacy Policy is accessible and complete.
- [ ] Terms of Service is accessible and complete.
- [ ] Multiple users can use the application at the same time.
- [ ] Frontend is responsive and usable.
- [ ] Secrets are kept out of Git.
- [ ] Database schema is clear.
- [ ] Email/password registration and login are secure.
- [ ] Frontend and backend input validation are implemented.
- [ ] Browser-to-backend communication uses HTTPS.
- [ ] The team has at least 14 complete module points.
- [ ] Every claimed module satisfies every listed subject requirement.
- [ ] Every team member can explain their own contribution and the main project flow.

---

# Rule to remember for every module

Do not start from:

~~~text
We have a feature that looks similar,
so maybe we can claim the module.
~~~

Start from:

~~~text
Read exact subject module
        |
        v
List every required item
        |
        v
Implement each item
        |
        v
Test each item
        |
        v
Document each item
        |
        v
Prepare a demo
~~~

If one required item is missing, treat the module as incomplete until it is fixed.
