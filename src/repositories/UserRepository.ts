import User, { UserType } from "../models/user.model";

export class UserRepository {
    public async create(user: UserType) {
        return await User.create(user);
    }
    public async update(userId: string, payload: Partial<UserType>) {
        return await User.findByIdAndUpdate(userId, payload, { new: true });
    }

    public async findByEmail(email: string) {
        return await User.findOne({ email });
    }
    public async deleteById(userId: string) {
        return await User.findByIdAndDelete(userId);
    }
    public async findById(userId: string) {
        return await User.findById(userId);
    }
    public async findAll() {
        return await User.find();
    }
}
