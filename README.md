# School Management API
This code is cloned and edited from:[qantra-io/axion (github.com)](https://github.com/qantra-io/axion/)
This was done according to this hiring challenge:
https://www.linkedin.com/posts/bahi-hussein_github-qantra-ioaxion-activity-7162392778562301952-Dqmr?utm_source=share&utm_medium=member_desktop
**Note:** Entry point is app.js

## Api documentation

## User endpoints

### **POST** /api/user/createUser
#### Description
Creates a new user account with a school field. However, if isAdmin set to true meaning they are a superadmin they require no school field.  **NOTE:** school must exist in database.
#### Request
 -   **Content-Type:** `application/json`
 -   **Body Parameters:**
    -   `email` (string, required): The email address of the user.
    -   `username` (string, required): The username of the user.
    -   `password` (string, required): The password of the user.
    -   `isAdmin` (boolean, optional): Indicates whether the user is an administrator. Defaults to `false` if not provided.
    -   `school` (string, optional): The school the user is affiliated with. Required if `isAdmin` is `false`.
  
 -   **Creating a super admin:**
	- {
		    "email": "example@superadmin.com",
		    "username": "user",
		    "password": "password",
		    "isAdmin": true
	}

 - **Creating a schooladmin:**
	- {  
			"email":  "example@student.com",  
			"username":  "user",  
			"password":  "password",  
			"school":  "school"  
			}
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "user": {
        user},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User created successfully."
}
### **GET** /api/user/getUser
#### Description
Returns current user
#### Request
 -   **token:** `shorttoken or longtoken`
 
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        user},

}
### **DELETE** /api/user/deleteUserByEmail
#### Description
Deletes current user with email.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   **Body Parameters:**
    -   `email` (string, required): The email address of the user.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "message": "User deleted successfully."
}
### **PUT** /api/user/updateUserByEmail
#### Description
Updates current user by email. It can accept parameter oldEmail if email will be updated too.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   **Body Parameters:**
    -   `email` (string, required): The new or current email address of the user.
    -   `username` (string, required): The new or current username of the user.
    -   `password` (string, required): The new or current password of the user.
    -   `oldEmail` (string, optional): The current email of the user if email contains new email of user.
  
 -   **Updating user with current email:**
	- {
	"username":  "newusername",
	"email":  "current@email.com",
	"password":  "newpassword"
	}

 - **Updating user with new email:**
	- {
	"username":  "newusername",
	"email":  "new@email.com",
	"password":  "newpassword",
	"oldEmail": "current@email.com"
	}
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        user},
    "message": "User updated successfully."
}

## School Endpoints (only accessible to superAdmins)

### **POST** /api/user/createSchool
#### Description
Creates a new school
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken``
 -   **Body Parameters:**
    -   `name` (string, required): The name of the school.
    -   `location` (string, required): The location of the school.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        school},
    "message": "School created successfully."
}
### **GET** /api/user/getSchools
#### Description
Returns all schools in database
#### Request
 -   **token:** `shorttoken or longtoken`
 
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        schools},

}
### **DELETE** /api/user/deleteSchoolByID
#### Description
Deletes school using schoolID
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   **Body Parameters:**
    -   **`schoolID`** (string, required): objectID of school you want to delete.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "message": "User deleted successfully."
}
### **PUT** /api/user/updateSchoolByID
#### Description
Updates school location using SchoolID.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   
**Body Parameters:**
    -   **`schoolID`** (string, required): objectID of school you want to update.
    -      **`location`** (string, required): new or current location of school you want to update.

#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        updatedSchool},
    "message": "School updated successfully."
}

## Classroom Endpoints (only accessible to school admins)

### **POST** /api/user/createClassroom
#### Description
Creates a new classroom in the affiliated school of the creator.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken``
 -   **Body Parameters:**
    -   **`name`** (string, required): The name of the classroom.
    -   **`location`** (number, required): The number of students allowed per classroom.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        classroom},
    "message": "Classroom created successfully."
}
### **GET** /api/user/getClassroomByName
#### Description
Returns a classroom from the database using Name
#### Params
 -   **name:** classname
#### Request
 -   **token:** `shorttoken or longtoken`
 
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        classroom},

}
### **DELETE** /api/user/deleteClassroomByName
#### Description
Removes classroom from school and deletes it.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   **Body Parameters:**
    -   **`name`** (string, required): name of classroom you want to delete.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "message": "Classroom deleted successfully."
}
##
## Student Endpoints (only accessible to school admins)

### **POST** /api/user/createStudent
#### Description
Creates a new student in a classroom in the affiliated school of the creator.
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken``
 -   **Body Parameters:**
    -   **`username`** (string, required): The name of the student.
    -   **`classroom`** (string, required): The classroom that the student will be created in.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        student},
    "message": "Classroom created successfully."
}
### **GET** /api/user/getStudentByUsername
#### Description
Returns a student from the database using name
#### Params
 -   **username:** student name
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        schools},

}
### **DELETE** /api/user/deleteStudentByUsername
#### Description
Deletes student using username and removes its from classroom
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   **Body Parameters:**
    -   **`username`** (string, required): name of student you want to delete.
#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "message": "Student deleted successfully."
}
### **PUT** /api/user/updateStudentByUsername
#### Description
Updates student class using student username
#### Request
 -   **Content-Type:** `application/json`
 -   **token:** `shorttoken or longtoken`
 -   
**Body Parameters:**
    -   **`username`** (string, required): name of student to be updated.
    -      **`classroom`** (string, required): new classroom of student.

#### Response
-   **Content-Type:** `application/json`
-   **Success Response:**
    -   **Status:** 200 OK
    -   **Body:**
	    - {
    "data": {
        updatedStudent},
    "message": "Student updated successfully."
}
