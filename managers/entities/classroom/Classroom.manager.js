module.exports = class Classroom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, middleware }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.classroomsCollection     = "classrooms";
        this.httpExposed         = ['post=createClassroom','get=getClassroomByName','delete=deleteClassroomByName','put=updateClassroomByName'];
    }

    async verifyUser(ID,classroom=null) {
        try {
            const user = await this.mongomodels.User.findOne({ _id: ID });
            if (!user) {
                throw new Error("User not found.");
            }
            if (user.isAdmin) {
                throw new Error("SuperAdmin can't access students.");
            }
            if (classroom && classroom.hasOwnProperty("school") && user.affiliatedSchool != classroom.school){
                throw new Error("Classroom not in your school");
            }
            return {
                user: user,
                message: "School admin verified"
            };
        } catch (error) {
            throw new Error("Failed to verify user: " + error.message);
        }
    }
    async createClassroomInDatabase(classroomData) {
        return await this.mongomodels.Classroom.create(classroomData);
    }
    
    async getClassroomFromDatabase(name) {
        return await this.mongomodels.Classroom.findOne({ name });
    }
    
    async updateClassroomInDatabase(name, classroomData) {
        return await this.mongomodels.Classroom.findOneAndUpdate({ name }, classroomData, { new: true });
    }
    
    async deleteClassroomFromDatabase(name) {
        return await this.mongomodels.Classroom.findOneAndDelete({ name });
    }
    async addStudentToClassroom(username, name){
        try {
            // Find the student
            let student = await this.mongomodels.Student.findOne({ username });
            if (!student) {
                return {
                    error: "Student not found."
                };
            }  
            // Find the classroom
            let classroom = await this.getClassroomFromDatabase(name);
            if (!classroom) {
                return {
                    error: "Classroom not found."
                };
            }
            if (classroom.vacancy==0) {
                return{
                    error: "Classroom full"
                };
            }

            // Update the student's classroom field
            student.classroom = name;
    
            // Save the updated student document
            await student.save();
            
            // Add the student to the classroom's students array
            if (!classroom.students) {
                classroom.students = []; // Ensure students array exists
            }
            classroom.vacancy--;
            classroom.students.push(student._id);
    
            // Save the updated classroom document
            await classroom.save();
    
            return {
                message: "Student added to classroom successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to add student to classroom."
            };
        }
    }
    async removeStudentFromClassroom(username, name) {
        try {
            // Find the student
            let student = await this.mongomodels.Student.findOne({ username });
            if (!student) {
                return {
                    error: "Student not found."
                };
            }
    
            // Find the classroom
            let classroom = await this.getClassroomFromDatabase(name);
            if (!classroom) {
                return {
                    error: "Classroom not found."
                };
            }
    
            // Check if the student is in the classroom
            const studentIndex = classroom.students.indexOf(student._id);
            if (studentIndex === -1) {
                return {
                    error: "Student is not in the classroom."
                };
            }
    
            // Remove the student from the classroom's students array
            classroom.students.splice(studentIndex, 1);
            classroom.vacancy++;
    
            // Save the updated classroom document
            await classroom.save();
    
            // Remove the classroom reference from the student document
            student.classroom = undefined; // or null depending on your schema definition
            await student.save();
    
            return {
                message: "Student removed from classroom successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to remove student from classroom."
            };
        }
    }
    
    
    async createClassroom({ __token,name, vacancy }) {
        const token=__token
        let decoded_ID= __token.userId
        const user = null
        try{
            user=this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error.message
            };
        }
        
        const classroomData = { name, vacancy,school:user.affiliatedSchool};
    
        // Data validation
        let result = await this.validators.Classroom.createClassroom(classroomData);
        if(result) return result;
    
        try {
            let createdClassroom = await this.createClassroomInDatabase(classroomData);
            return {
                classroom: createdClassroom,
                message: "Classroom created successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to create classroom."
            };
        }
    }
    
    async getClassroomByName({ __token,__query }) {
        const token=__token
        let decoded_ID= __token.userId
        let query= __query
        const name = query.name
        try {
            const classroom = await this.getClassroomFromDatabase(name);
            if (!classroom) {
                return {
                    error: "Classroom not found."
                };
            }
            this.verifyUser(decoded_ID,classroom)
            return {
                classroom
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to fetch classroom."
            };
        }
    }
    
    async updateClassroomByName({ __token, name, vacancy, students }) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            this.verifyUser(decoded_ID,name)
        }catch(error){
            return {
                error: error.message
            };
        }
        try {
            const classroomData = { name, vacancy, students };
            // Data validation
            let result = await this.validators.Classroom.createClassroom(classroomData);
            if(result) return result;
            this.verifyUser(decoded_ID,classroomData)
            const updatedClassroom = await this.updateClassroomInDatabase(name, classroomData);
            if (!updatedClassroom) {
                return {
                    error: "Classroom not found."
                };
            }
            return {
                classroom: updatedClassroom,
                message: "Classroom updated successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to update classroom."
            };
        }
    }
    
    async deleteClassroomByName({__token, name }) {
        const token=__token
        let decoded_ID= __token.userId
        classroom=this.getClassroomByName(name)
        try{
            this.verifyUser(decoded_ID,classroom)
        }catch(error){
            return {
                error: error.message
            };
        }
        try {
            const deletedClassroom = await this.deleteClassroomFromDatabase(name);
            if (!deletedClassroom) {
                return {
                    error: "Classroom not found."
                };
            }
            return {
                message: "Classroom deleted successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to delete classroom."
            };
        }
    }
    
}