module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['post=createUser','get=getUserByEmail','delete=deleteUserByEmail','put=updateUserByEmail'];
    }



    async createUserInDatabase(userData) {
        return await this.mongomodels.User.create(userData);
    } 
    async updateUserInDatabase(email, userData) {
        return await this.mongomodels.User.findOneAndUpdate({ email }, userData, { new: true });
    } 
    async getUserFromDatabase(email) {
        return await this.mongomodels.User.findOne({ email })
    }
    async deleteUserFromDatabase(email){
        return await this.mongomodels.User.findOneAndDelete({ email });
    }

    async createUser({username, email, password, isAdmin=false, school="school"}){
        let user;
        if (isAdmin == false && school=="school") {
            return {
                error: "Failed to create user. Missing school field!"
            };
        }else if (isAdmin == false){
            let affiliatedSchool=school
            user = {username, email, password, isAdmin, affiliatedSchool}
        }else {
            user = {username, email, password, isAdmin};
        }
        // Data validation
        let result = await this.validators.User.createUser(user);
        if(result) return result;
        

        // Create the user
        try {
            let createdUser     = await this.createUserInDatabase(user);
            let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key });
            return {
                user: createdUser,
                token: longToken, 
                message: "User created successfully."
            };
        } catch (error) {
            console.log(error)
            return {
                error: "Failed to create user."
            };
        }
    }

    async getUserByEmail(__query) {
        let query= __query
        const email = query.__query.email
        try {
            const user = await this.getUserFromDatabase(email);
            if (!user) {
                return {
                    error: "User not found."
                };
            }
            return {
                user
            };
        } catch (error) {
            console.log(error)
            return {
                error: "Failed to fetch user."
            };
        }
    }

    async updateUserByEmail({username, email, password, oldEmail}) {
        try {
            const userData={username, email, password};
            // Data validation
            let result = await this.validators.User.createUser(userData);
            if(result) return result;
            
            const updatedUser = await this.updateUserInDatabase(oldEmail, userData)
            if (!updatedUser) {
                return {
                    error: "User not found."
                };
            }
            return {
                user: updatedUser,
                message: "User updated successfully."
            };
        } catch (error) {
            console.log(error)
            return {
                error: "Failed to update user."
            };
        }
    }

    async deleteUserByEmail({email}) {
        try {
            const deletedUser = await this.deleteUserFromDatabase(email)
            if (!deletedUser) {
                return {
                    error: "User not found."
                };
            }
            return {
                message: "User deleted successfully."
            };
        } catch (error) {
            console.log(error)
            return {
                error: "Failed to delete user."
            };
        }
    }
}
