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
    async getUserById(_id){
        return await this.mongomodels.User.findOne({ _id })
    }
    async deleteUserFromDatabase(email){
        return await this.mongomodels.User.findOneAndDelete({ email });
    }
    async verifyUser(email,password) {
        try{
            user = await this.getUserFromDatabase(email)
            if (!user) {
                return {error:"Wrong email"};
            }
            if (user.password!=password) {
                return {error:"Wrong Password"};
            }
            return{
                user: user,
                message:"login Successful"
            };
        }catch(error){
            return{
                error:"Login Failed",
                message: error
            };
        }
    }
    async verifyEmail(email,id){
        user = await this.getUserById(id)
        if(user.email==email){
            return{message: "email belongs to current user."};
        }
        else{
            return{error: "email doesn't belong to current user."};
        }
    }
    async verifySchool(name){
        try{
            school= await this.mongomodels.School.findOne({name})
            if (!school) {
                return{
                    error:"School doesn't exist."
                };
            }
        }catch(error){
            console.log(error)
            return {error:"Failed to create user."};
        }


    }

    async createUser({username, email, password, isAdmin=false, school="school"}){
        let user;
        if (isAdmin == false && school=="school") {
            return {
                error: "Failed to create user. Missing school field!"
            };
        }else if (isAdmin == false){
            this.verifySchool(school)
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

    async loginUser({email, password}) {
        try{
            let user            = await this.verifyUser(email, password)
            let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key });
            let shortToken      = this.tokenManager.v2_createShortToken(longToken)
            return {
                message: "login successful",
                user: user,
                longToken: longToken,
                shortToken: shortToken
            };
        }catch(error){
            return{
                error:error
            };
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

    async updateUserByEmail({__token,username, email, password, oldEmail=null}) {
        try {
            const token=__token
            let decoded_ID= __token.userId
            const userData={username, email, password};
            // Data validation
            let result = await this.validators.User.createUser(userData);
            if(result) return result;
            if(!oldEmail){oldEmail=email}
            this.verifyEmail(oldEmail, decoded_ID)

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

    async deleteUserByEmail({__token,email}) {
        try {
            const token=__token
            let decoded_ID= __token.userId
            this.verifyEmail(email,decoded_ID)
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
