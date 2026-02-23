
Advanced Inventory Management System
--------------------------------

A professional-grade, full-stack inventory solution featuring Role-Based Access Control (RBAC), real-time stock tracking, and an automated DevOps pipeline.


-------------------

Key Features
--------------
Secure Authentication: Custom JWT implementation with refresh/access token logic.

Dynamic Inventory: Full CRUD operations for products, categories, and stock levels.

Interactive API Docs: Fully documented REST API using Swagger/OpenAPI.

Robust CI/CD: Automated testing and build verification for every push using GitHub Actions.

Modern UI: Built with React 18, featuring smooth transitions design.

---------------------

Tech Stacks
------
Backend - Django 6.0, Django REST Framework, SQLite, SimpleJWT
Frontend - React 18, Axios, ,CSS Modules, Lucide Icons,React Router 6 
DevOps/Tools - GitHub Actions (CI/CD), Context API, Swagger / UI, Python 3.12, NPM / Node 18

----
CI/CD Pipeline
------
This project implements a professional Continuous Integration workflow. Every time code is pushed:

Backend Job: Sets up a Python 3.12 environment, installs dependencies, and runs manage.py check.
Frontend Job: Sets up Node.js 18, installs packages, and verifies the production build.

-------------

API Documentation
------------
Once the server is running, you can explore the interactive API documentation at:
Swagger UI: http://localhost:8000/swagger/
Redoc: http://localhost:8000/redoc/

----
Getting Started
-----
Backend Setup

`cd inventory`

`python -m venv env`

`source env/bin/activate` (or `env\Scripts\activate` on Windows)

`pip install -r requirements.txt`

`python manage.py migrate`

`python manage.py runserver`

Frontend Setup

`cd inventory/frontend`

`npm install`

`npm start`

Initial Setup
---------

To access the Admin Panel or protected API routes, you need to create a superuser:

Follow the prompts to set your own username, email, and password.
