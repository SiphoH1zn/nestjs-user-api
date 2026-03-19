#Employee Management API

##Overview

The Employee Management API is a RESTful API built with NestJS and Firebase Firestore. It allows you to manage employees by creating, reading, updating and deleting employee records. The API is secured with API Key Authentication meaning every request must include a valid API key in the request header otherwise it returns a 401 Unauthorized response.
How it Works at a High Level
When a client sends a request to the API, the request does not go straight to the database. It passes through several layers first. The first layer checks the API key  if it is missing or wrong the request is immediately blocked and the client gets a 401 Unauthorized response. If the key is correct the request moves to the next layer which checks that the data in the request body is valid  for example that the email is a real email address and the name is not empty. Once the data passes validation it reaches the controller which figures out what operation the client wants to perform. The controller hands the work to the service which contains all the business logic. The service then calls the database connection which talks to Firebase Firestore to store or retrieve the data. The result is then sent back to the client as a response.

##Tech Stack

NestJS is the main backend framework. It handles routing, modules and dependency injection. It was chosen because its architecture of controllers, services and modules is very similar to ASP.NET Core, making it a natural transition for developers coming from a .NET background.
TypeScript is the programming language used throughout the project. It adds strong typing to JavaScript which helps catch errors at compile time before the application runs.
Firebase Firestore is the NoSQL cloud database where all employee records are stored. Unlike a relational database like SQL Server, Firestore stores data as documents inside collections — similar to JSON objects. There are no tables, no schemas and no migrations.
Firebase Admin SDK is the official server-side library that allows your NestJS application to securely connect to Firebase. It authenticates using a service account private key.
class-validator is a library that provides decorators for validating incoming request data. For example it can check that an email address is valid, that a name is not empty, or that a role is one of the allowed values.
class-transformer works alongside class-validator to transform incoming data before it is validated. For example it can trim extra whitespace from a name before checking if it is empty.
dotenv is a library that reads environment variables from a .env file during local development. This keeps sensitive credentials like Firebase keys out of the source code.
Microsoft Azure App Service is the cloud platform where the API is deployed and hosted. It runs the NestJS application on a Linux server and makes it accessible over the internet.

##Steps
##Step 1: Scaffold the NestJS Project
Before starting make sure you have Node.js version 18 or 20 installed on your machine. You also need the NestJS CLI which you can install by running:
npm i -g @nestjs/cli
You will also need a Firebase account at console.firebase.google.com with a project created and Firestore enabled, and an Azure account at portal.azure.com.

##Step 2: Scaffold the Project
Run the following command to create a new NestJS project:
nest new employee-api --strict --package-manager npm
cd employee-api
The --strict flag enables strict TypeScript mode which catches more bugs during development before they become runtime problems. NestJS generates a complete project structure with all the necessary boilerplate files to get started.
After the project is created delete the three default files that came with it since we are building everything from scratch: rm src/app.controller.ts rm src/app.controller.spec.ts rm src/app.service.ts

##Step 3: Install Dependencies
npm install firebase-admin dotenv class-validator class-transformer
Firebase-admin lets the server securely connect to Firebase Firestore. Dotenv reads secret credentials from the .env file during local development. Class-validator validates request bodies and class-transformer transforms incoming data before validation.

##Step 4: Set Up Firebase
Go to console.firebase.google.com and create a new project. Once created go to Project Settings, click on Service Accounts and then click Generate new private key. This downloads a JSON file to your computer. Open that file and you will find three values you need — the project ID, the client email and the private key.

##Step 5: Configure Environment Variables
Create a .env file in the root of the project and paste in your Firebase values along with an API key of your choice:
FIREBASE_PROJECT_ID=your-project-id FIREBASE_CLIENT_EMAIL=your-client-email FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" 
API_KEY=dfvfsdvdsvvfsdvsfvs
PORT=3000

Then make sure .env is listed in your .gitignore file. This is critical — if .env gets pushed to GitHub anyone can see your Firebase credentials and access your database.

##Step 6: Configure tsconfig.json
Open the tsconfig.json file and make sure emitDecoratorMetadata and experimentalDecorators are both set to true. NestJS relies heavily on decorators and without these two settings the decorators will not work and the application will not run correctly.

##Step 7: Update main.ts
This is the first file that runs when the application starts. It is responsible for four things.
First it loads the environment variables from the .env file. This must happen before anything else because if it runs after, Firebase tries to connect before the credentials are loaded and the app crashes.
Second it enables CORS which stands for Cross-Origin Resource Sharing. This is a browser security feature that blocks requests from one domain to another by default. Since the Next.js frontend hosted on Netlify calls the API hosted on Azure, the browser sees it as a cross-origin request and blocks it unless the server explicitly allows it. The x-api-key header must also be listed in the allowed headers otherwise the browser blocks any request that includes it.
Third it enables global validation so that all incoming request data is automatically checked against the validation rules defined in the model files.
Fourth it starts the server on the correct port. Azure assigns its own port number at runtime. If the port is hardcoded the application will not be reachable on Azure, so the server reads the port from an environment variable that Azure injects automatically.

##Step 8: The Database Connection - database.service.ts and database.module.ts
The database service is responsible for one thing — connecting to Firebase Firestore when the application starts and making that connection available to the rest of the app.
It uses the three Firebase credentials from the environment variables to authenticate with Google's servers. There is a check to make sure Firebase is not initialized twice because during development when files change and the server reloads, trying to initialize Firebase again would cause an error.
The private key requires special handling because when it is stored as an environment variable on Azure the newline characters in the key get stored as the literal text backslash-n instead of real line breaks. Firebase needs real line breaks to read the key correctly so a replace operation converts them back.
The database module is marked as global which means the database service is automatically available to every other module in the application without needing to import it separately each time.

##Step 9: Create the Employee Model
This file defines three things.
The first is the Role enum which lists the only three valid roles an employee can have — INTERN, ENGINEER and ADMIN. If a client tries to send any other value it is automatically rejected.
The second is the CreateEmployee class which defines the rules for creating a new employee. The name must not be empty and leading or trailing spaces are trimmed automatically before validation so that a name like " " gets correctly rejected. The email must be a valid email format. The role must be one of the three values in the Role enum.
The third is the UpdateEmployee class which has the same fields as CreateEmployee but all of them are optional. This is because when updating you might only want to change the role without touching the name or email, so partial updates are supported.
There is also an Employee interface that describes what a complete employee object looks like including the database-generated ID and the timestamps. This is used as the return type for all service methods.

##Step 10: Create the API Key Guard
The guard runs before every single request reaches the controller. Think of it as a bouncer standing at the door.
When a request comes in the guard reads the x-api-key value from the request headers. It then compares that value with the API_KEY stored in the server's environment variables. If they match the guard returns true and the request is allowed through to the controller. If they do not match or if no key was provided at all the guard throws an Unauthorized exception which automatically sends a 401 response back to the client and the request goes no further.
The client never sees the server's API key. The server simply compares what the client sent with what it already knows.
Step 11: Create the Employees Service
The service is where all the actual work happens. It contains five operations.
Creating an employee — the service takes the validated data from the controller, adds the current date and time as createdAt and updatedAt timestamps, and saves the record to Firestore. The ID is automatically generated by Firestore and attached to the returned object.
Getting all employees — the service retrieves all employee records from Firestore. If a role filter was provided it adds a where condition to only return employees with that role. The same method handles both the filtered and unfiltered cases.
Getting one employee — the service looks up a single employee by their Firestore document ID. If the document does not exist it returns null.
Updating an employee — the service updates only the fields that were provided in the request body and automatically refreshes the updatedAt timestamp. The updated record is then fetched and returned.
Deleting an employee — the service deletes the Firestore document with the given ID.

##Step 12: Create the Employees Controller
The controller is the entry point for HTTP requests. It does not contain any business logic — its only job is to receive requests, extract the relevant data from them and pass that data to the service.
The guard is applied at the controller level which means every single endpoint in the controller is protected automatically. This is safer than applying it per endpoint because there is no risk of accidentally leaving one unprotected.
Each method in the controller maps to one HTTP verb and URL pattern. The controller reads data from three possible places depending on the request — the request body for POST and PATCH requests, the URL path for the ID in GET, PATCH and DELETE requests, and the URL query string for the role filter in GET requests.

##Step 13: Wire Up the Modules
The employees module groups the controller, service and database dependency together so NestJS knows how they relate to each other.
The app module is the root of the entire application. It imports both the database module and the employees module. When the application starts NestJS reads the app module and uses it to wire everything together and start all the services.

#Step 14: Run and Test Locally
npm run start:dev
