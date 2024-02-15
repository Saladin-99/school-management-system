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
    async addStudentToClass(student){
        const classroom= await this.mongomodels.Classroom.findOne({name:student.classroom})
        if(student && classroom){
            if (!classroom.students){
                classroom.students=[];
            }
            if (classroom.vacancy==0){
                throw new Error("Classroom full!");
            }
            classroom.students.push(student._id)
            classroom.vacancy--;
            await classroom.save();
        }
    }
    async removeStudentFromClass(student) {
        const classroom= await this.mongomodels.Classroom.findOne({name:student.classroom})
        if(student && classroom){
            // Check if the student is in the classroom
            const studentIndex = classroom.students.indexOf(student._id);

            // Remove the student from the classroom's students array
            classroom.students.splice(studentIndex, 1);
            classroom.vacancy++;
    
            // Save the updated classroom document
            await classroom.save();
        }
    }
    async createStudentInDatabase(studentData) {
        const student = await this.mongomodels.Student.create(studentData)
        try{
            await this.addStudentToClass(student)
            return student;
        }catch(error){
            throw error
        }

    } 

    async getStudentFromDatabase(username) {
        return await this.mongomodels.Student.findOne({username: username});
    }

    async updateStudentInDatabase(username, studentData) {
        return await this.mongomodels.Student.findOneAndUpdate({ username }, studentData, { new: true });
    } 

    async deleteStudentFromDatabase(username) {
        const student= await this.mongomodels.Student.findOneAndDelete({ username });
        await this.removeStudentFromClass(student)
        return student
    }
    async verifyUser(ID) {
        try {
            const user = await this.mongomodels.User.findOne({ _id: ID });
            if (!user) {
                throw new Error("User not found.");
            }
            if (user.isAdmin) {
                throw new Error("SuperAdmin can't access students.");
            }
            return user;
        } catch (error) {
            throw new Error("failed to verify user: " + error.message);
        }
    }

    async verifySchoolAndClass(adminschool, classname) {
        try{
            const classroom = await this.mongomodels.Classroom.findOne({ name: classname});
            if (!classroom){
                throw new Error("Classroom doesn't exist ");
            }
            if (classroom.school!=adminschool) {
                throw new Error("This class isn't in your school");
            }
            return{

            };
        } catch(error) {
            console.log(error);
            throw new Error("Failed to verify user: "+ error.message);
        }


    }
    


    async createStudent({__token, username, classroom}) {
        const token=__token
        let decoded_ID= __token.userId
        let user
        // Data validation
        const student = {username, classroom};
        let result = await this.validators.Student.createStudent(student);
        if(result) return result;
        try{
           user= await this.verifyUser(decoded_ID)
           await this.verifySchoolAndClass(user.affiliatedSchool,classroom)
        }catch(error){
            return {
                error: error.message
            };
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
        let user
        try{
            user= await this.verifyUser(decoded_ID)
        }catch(error){
            return {
                error: error.message
            };
        }
        try {
            const student = await this.getStudentFromDatabase(username);
            if (!student) {
                return {
                    error: "Student not found."
                };
            }
            await this.verifySchoolAndClass(user.affiliatedSchool,student.classroom)
            return {
                student
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to fetch student: " + error.message
            };
        }
    }

    async updateStudentByUsername({__token,username, classroom}) {
        const token=__token
        let decoded_ID= __token.userId
        let user
        const student= await this.getStudentFromDatabase(username)
        const oldclass=student.classroom
        if (!student){
            return{error:"Student doesn't exist"};
        }
        try{
            user= await this.verifyUser(decoded_ID)
            await this.verifySchoolAndClass(user.affiliatedSchool, classroom)
        }catch(error){
            return {
                error: error.message
            };
        }
        try {
            const studentData = {username, classroom};
            // Data validation
            let result = await this.validators.Student.createStudent(studentData);
            if(result) return result;
            student.classroom=classroom
            await this.addStudentToClass(student)
            student.classroom = oldclass
            const updatedStudent = await this.updateStudentInDatabase(username, studentData);
            await this.removeStudentFromClass(student)
            return {
                student: updatedStudent,
                message: "Student updated successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to update student: " + error.message
            };
        }
    }

    async deleteStudentByUsername({__token, username}) {
        const token=__token
        let decoded_ID= __token.userId
        let user
        const student= await this.getStudentFromDatabase(username)
        if(!student){
            return{error: "student doesn't exist"}
        }
        try{
            user= await this.verifyUser(decoded_ID)
            await this.verifySchoolAndClass(user.affiliatedSchool, student.classroom)
        }catch(error){
            return {
                error: error.message
            };
        }
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
