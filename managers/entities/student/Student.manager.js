module.exports = class Student { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, middleware }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.studentsCollection     = "students";
        this.httpExposed         = ['post=createStudent','get=getStudentByUsername','delete=deleteStudentByUsername','put=updateStudentByUsername'];
    }
    async createStudentInDatabase(studentData) {
        return await this.mongomodels.Student.create(studentData);
    } 

    async getStudentFromDatabase(username) {
        return await this.mongomodels.Student.findOne({username: username});
    }

    async updateStudentInDatabase(username, studentData) {
        return await this.mongomodels.Student.findOneAndUpdate({ username }, studentData, { new: true });
    } 

    async deleteStudentFromDatabase(username) {
        return await this.mongomodels.Student.findOneAndDelete({ username });
    }
    async verifyUser(ID) {
        try {
            const user = await this.mongomodels.User.findOne({ _id: ID });
            if (!user) {
                return {
                    error: "User not found."
                };
            }
            if (user.isAdmin) {
                return {
                    error: "SuperAdmin can't access students."
                };
            }
            return {
                user:user,
                message: "School admin verified"
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to verify user."
            };
        }
    }

    async verifySchoolAndClass(adminschool, classname) {
        try{
            classroom = await this.mongomodels.Classroom.findOne({ name: classname});
            if (!classroom){
                return {
                    error: "Classroom doesn't exist"
                };
            }
            if (classroom.school!=adminschool) {
                return {
                    error: "This class isn't in your school"
                };
            }
            return{

            };
        } catch(error) {
            console.log(error);
            return {
                error: "Failed to verify user."
            };
        }


    }
    


    async createStudent({__token, username, classroom}) {
        const token=__token
        let decoded_ID= __token.userId
        let user=null
        try{
           user= this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error
            };
        }

        const student = {username, classroom};

        // Data validation
        let result = await this.validators.Student.createStudent(student);
        if(result) return result;

        if (classroom){
            this.verifySchoolAndClass(user.affiliatedSchool,classroom)
        }

        try {
            let createdStudent = await this.createStudentInDatabase(student);
            return {
                student: createdStudent,
                message: "Student created successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to create student."
            };
        }
    }

    async getStudentByUsername({__token,__query}) {
        const token=__token
        let query= __query
        const username = query.username
        let decoded_ID= __token.userId
        try{
            this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error
            };
        }
        try {
            const student = await this.getStudentFromDatabase(username);
            if (!student) {
                return {
                    error: "Student not found."
                };
            }
            return {
                student
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to fetch student."
            };
        }
    }

    async updateStudentByUsername({__token,username, classroom}) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error
            };
        }
        try {
            const studentData = {username, classroom};
            // Data validation
            let result = await this.validators.Student.createStudent(studentData);
            if(result) return result;

            const updatedStudent = await this.updateStudentInDatabase(username, studentData);
            if (!updatedStudent) {
                return {
                    error: "Student not found."
                };
            }
            return {
                student: updatedStudent,
                message: "Student updated successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to update student."
            };
        }
    }

    async deleteStudentByUsername({__token, username}) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error
            };
        }
        try {
            const studentData = {username};
            // Data validation
            let result = await this.validators.Student.createStudent(studentData);
            if(result) return result;
            const deletedStudent = await this.deleteStudentFromDatabase(username);
            if (!deletedStudent) {
                return {
                    error: "Student not found."
                };
            }
            return {
                message: "Student deleted successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to delete student."
            };
        }
    }
}
