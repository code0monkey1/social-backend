import User, { UserType } from "../models/user.model";

export class UserRepository {
    public async create(user: Partial<UserType>) {
        return await User.create(user);
    }
    public async findByIdAndUpdate(userId: string, payload: Partial<UserType>) {
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
    public async getUserRecommendations(following: string[]) {
        return await User.find({ _id: { $nin: following } }).select("name _id");
    }
    public async addFollower(userToFollowId: string, followerId: string) {
        return await User.findByIdAndUpdate(userToFollowId, {
            $push: { followers: followerId },
        });
    }

    public async addFollowing(userFollowingId: string, userToFollowId: string) {
        return await User.findByIdAndUpdate(userFollowingId, {
            $push: { following: userToFollowId },
        });
    }

    public async removeFollower(
        followedUserId: string,
        followingUserId: string,
    ) {
        return await User.findByIdAndUpdate(followedUserId, {
            $pull: { followers: followingUserId },
        });
    }

    public async removeFollowing(
        followerUserId: string,
        userBeingFollowedId: string,
    ) {
        return await User.findByIdAndUpdate(followerUserId, {
            $pull: { following: userBeingFollowedId },
        });
    }
}
