module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, middleware }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.schoolsCollection     = "schools";
        this.httpExposed         = [
            'post=createSchool',
            'get=getSchools',
            'delete=deleteSchoolByID',
            'put=updateSchoolByID'
        ];
    }

    async createSchoolInDatabase(schoolData) {
        return await this.mongomodels.School.create(schoolData);
    } 

    async getSchoolsFromDatabase() {
        return await this.mongomodels.School.find();
    }

    async updateSchoolInDatabase(_id, schoolData) {
        return await this.mongomodels.School.findOneAndUpdate({ _id }, schoolData, { new: true });
    } 

    async deleteSchoolFromDatabase(_id) {
        return await this.mongomodels.School.findOneAndDelete({ _id });
    }
    async verifyUser(ID) {
        try {
            const user = await this.mongomodels.User.findOne({ _id: ID });
            if (!user) {
                throw new Error("User not found.");
            }
            if (!user.isAdmin) {
                throw new Error("Access Denied");

            }
            return {
                user:user,
                message: "Super admin verified"
            };
        } catch (error) {
            throw new Error("Failed to verify user: " + error.message);
        }
    }

    async createSchool({  __token, name, location }) {
        const token=__token
        let decoded_ID= __token.userId
        const school = { name, location };
        try{
            await this.verifyUser(decoded_ID)
        }catch(error){
            return{error:error.message};
        }
        // Data validation
        let result = await this.validators.School.createSchool(school);
        if(result) return result;

        try {
            let createdSchool = await this.createSchoolInDatabase(school);
            return {
                school: createdSchool,
                message: "School created successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to create school:" + error.message
            };
        }
    }

    async getSchools({ __token}) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            await this.verifyUser(decoded_ID)
        }catch(error){
            return{error:error.message};
        }
        try {
            const schools = await this.getSchoolsFromDatabase();
            if (!schools) {
                return {
                    error: "No Schools in database"
                };
            }
            return {
                schools
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to fetch school."
            };
        }
    }

    async updateSchoolByID({__token, schoolID, location }) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            await this.verifyUser(decoded_ID)
        }catch(error){
            return{error:error.message};
        }
        try {
            const schoolData = { location };
            // Data validation
            let result = await this.validators.School.updateSchool(schoolData);
            if(result) return result;

            const updatedSchool = await this.updateSchoolInDatabase(schoolID, schoolData);
            if (!updatedSchool) {
                return {
                    error: "School not found."
                };
            }
            return {
                school: updatedSchool,
                message: "School updated successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to update school."
            };
        }
    }

    async deleteSchoolByID({ __token, schoolID }) {
        const token=__token
        let decoded_ID= __token.userId
        try{
            await this.verifyUser(decoded_ID)
        }catch(error){
            return{error:error.message};
        }
        try {
            const deletedSchool = await this.deleteSchoolFromDatabase(schoolID);
            if (!deletedSchool) {
                return {
                    error: "School not found."
                };
            }
            return {
                message: "School deleted successfully."
            };
        } catch (error) {
            console.log(error);
            return {
                error: "Failed to delete school."
            };
        }
    }
}
