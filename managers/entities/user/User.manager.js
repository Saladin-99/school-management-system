module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['post=createUser','get=getUser','delete=deleteUserByEmail','put=updateUserByEmail','loginUser'];
    }

    async addAdminToSchool(name, user) {
        try {
            const school = await this.mongomodels.School.findOne({ name });
            if (!school) {
                throw new Error("School not found.");
            }
            // Add the admin to the school's admin array
            if (!school.admins) {
                school.admins = []; // Ensure admins array exists
            }
            school.admins.push(user._id);
            await school.save();
        } catch (error) {
            console.error("Error adding admin to school:", error);
            throw error; // Propagate the error
        }
    }
    async removeAdminFromSchool(name, user) {
        try {
            const school = await this.mongomodels.School.findOne({ name });
            if (!school) {
                throw new Error("School not found.");
            }
            // Remove the admin from the school's admin array
            if (school.admins && school.admins.length > 0) {
                // Find the index of the user in the admins array
                const index = school.admins.findIndex(admin => admin.equals(user._id));
                if (index !== -1) {
                    // Remove the user from the admins array
                    school.admins.splice(index, 1);
                    await school.save();
                    return { message: "Admin removed from school successfully." };
                } else {
                    throw new Error("User is not an admin of this school.");
                }
            } else {
                throw new Error("School has no admins.");
            }
        } catch (error) {
            console.error("Error removing admin from school:", error);
            throw error; // Propagate the error
        }
    }
    
    
    async createUserInDatabase(userData) {
        try {
            const user = await this.mongomodels.User.create(userData);
            if (user.affiliatedSchool) {
                await this.addAdminToSchool(user.affiliatedSchool, user);
            }
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error; // Propagate the error
        }
    }
    
    async updateUserInDatabase(email, userData) {
        return await this.mongomodels.User.findOneAndUpdate({ email }, userData, { new: true });
    } 
    async getUserFromDatabase(email) {
        return await this.mongomodels.User.findOne({ email })
    }
    async getUserById(_id){
        return await this.mongomodels.User.findOne({ _id })
    }
    async deleteUserFromDatabase(email){
        try {
            const user = await this.getUserFromDatabase(email)
            if (user.affiliatedSchool) {
                await this.removeAdminFromSchool(user.affiliatedSchool, user);
            }
            return await this.mongomodels.User.findOneAndDelete({email})
        } catch (error) {
            console.error("Error creating user:", error);
            throw error; // Propagate the error
        }
    }
    async verifyUser(email, password) {
        try {
            const user = await this.getUserFromDatabase(email);
            if (!user || user.password !== password) {
                throw new Error("Invalid email or password.");
            }
            return {
                user: user,
                message: "Login successful."
            };
        } catch (error) {
            console.error("Error verifying user:", error);
            throw new Error("Login failed. Please try again later.");
        }
    }
    
    async verifyEmail(email, id) {
        try {
            const user = await this.getUserById(id);
            if (user.email === email) {
                return { message: "Email belongs to current user." };
            } else {
                throw new Error("Email doesn't belong to current user.");
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            throw new Error("Failed to verify email. Please try again later.");
        }
    }
    
    async verifySchool(name){
        try{
            const school= await this.mongomodels.School.findOne({name})
            if (!school) {
                throw new Error("School doesn't exist.");
            }
        }catch(error){
            console.log(error)
            throw new Error("Failed to verify school:" + error.message);
        }


    }

    async createUser({username, email, password, isAdmin=false, school="school"}){
        try {
            console.log("user: " + username + email)
            console.log(this.validators)
            let user;
            if (isAdmin == false && school=="school") {
                return {
                    error: "Failed to create user. Missing school field!"
                };
            }else if (isAdmin == false){
                try {
                    await this.verifySchool(school);
                } catch (error) {
                    return { error: error.message };
                }
                let affiliatedSchool=school
                user = {username, email, password, isAdmin, affiliatedSchool}
            }else {
                console.log("in user")
                user = {username, email, password, isAdmin};
            }
            // Data validation
            let result = await this.validators.User.createUser(user);
            if(result) return result;
        // Create the user
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

    async loginUser({__device, email, password }) {
        try {
            const user = await this.verifyUser(email, password);
            if (user.error) {
                return { error: user.error };
            }
            
            const longToken = this.tokenManager.genLongToken({ userId: user.user._id, userKey: user.user.key });
            const shortToken = this.tokenManager.v2_createShortToken({__device,longToken});
            return {
                message: "Login successful.",
                user: user.user,
                longToken: longToken,
                shortToken: shortToken
            };
        } catch (error) {
            console.error("Error logging in:", error);
            return { error: "Failed to log in. Please try again later." };
        }
    }

    async getUser({__token}) {
        const token=__token
        let decoded_ID= __token.userId
        try {
            const user = await this.getUserById(decoded_ID)
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

    async updateUserByEmail({ __token, username, email, password, oldEmail = null }) {
        try {
            const token = __token;
            const decodedId = __token.userId;
            const userData = { username, email, password };
            // Data validation
            let result = await this.validators.User.createUser(userData);
            if (result) return result;
            if (!oldEmail) {
                oldEmail = email;
            }
            await this.verifyEmail(oldEmail, decodedId); // This should be awaited
            const updatedUser = await this.updateUserInDatabase(oldEmail, userData);
            if (!updatedUser) {
                return { error: "User not found." };
            }
            return { user: updatedUser, message: "User updated successfully." };
        } catch (error) {
            console.error("Error updating user:", error);
            return { error: "Failed to update user: " + error.message};
        }
    }
    
    async deleteUserByEmail({ __token, email }) {
        try {
            const token = __token;
            const decodedId = __token.userId;
            await this.verifyEmail(email, decodedId); // This should be awaited
            const deletedUser = await this.deleteUserFromDatabase(email);
            if (!deletedUser) {
                return { error: "User not found." };
            }
            return { message: "User deleted successfully." };
        } catch (error) {
            return { error: "Failed to delete user: " + error};
        }
    }
}
