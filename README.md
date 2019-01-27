# Tamuhack2019-Backend
## Inspiration
Driving and seeing someone with their gas tank open.
## What it does
Notifies other cars who have an immediate problem that they may not be able to see, like having a tail light out, headlights off at night, gas cap stuck open, hood popped, etc.
## How we built it
The backend is written in Node.js and the frontend is done in React Native. The Node server and the client app communicate through a REST API, and the client integrates with Google Assistant for the voice recognition.
## Challenges we ran into
Testing can be a challenge with an application like this that is meant to communicate between cars and determine which car the user is talking about with real time location data, speed, and other data gathered from Smartcar. We created a testing portal that we have used throughout the Hackathon, but we have not yet had the chance to try it on real cars.
## Accomplishments that we're proud of
We were very proud of our ability to collaborate effectively as a team and clearly communicate, such that we got this project done right on time and had fun doing it.
## What we learned
We learned how to develop apps with react native, proper structure of a REST API, Node.js app design and package management with NPM, and how to integrate with the Smartcar API to gather data from cars in real time.
## What's next for Carma
If laws allow it, we’re looking at using Carma as a more generalized car communication app, where you can call other cars, have message conversations between cars. We would use this communication to save gas on long road trips, by having the cars draft behind each other on the highway, with a communicated speed via Carma.
