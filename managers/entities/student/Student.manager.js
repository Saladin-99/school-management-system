module.exports = class Student { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
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
        return await this.mongomodels.Student.findOne({ username });
    }

    async updateStudentInDatabase(username, studentData) {
        return await this.mongomodels.Student.findOneAndUpdate({ username }, studentData, { new: true });
    } 

    async deleteStudentFromDatabase(username) {
        return await this.mongomodels.Student.findOneAndDelete({ username });
    }

    async createStudent({username, classroom}) {
        const student = {username, classroom};

        // Data validation
        let result = await this.validators.Student.createStudent(student);
        if(result) return result;

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

    async getStudentByUsername(__query) {
        let query= __query
        const username = query.__query.username
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

    async updateStudentByUsername({username, classroom}) {
        try {
            const studentData = {classroom};
            // Data validation
            let result = await this.validators.Student.updateStudent(studentData);
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

    async deleteStudentByUsername({username}) {
        try {
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
