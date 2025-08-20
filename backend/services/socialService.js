const User = require('../models/User');
const NotificationService = require('./notificationService');

class SocialService {
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
  }

  async followUser(followerId, followingId) {
    try {
      if (followerId.equals(followingId)) {
        throw new Error('Cannot follow yourself');
      }

      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new Error('User not found');
      }

      // Check if already following
      if (follower.following.includes(followingId)) {
        throw new Error('Already following this user');
      }

      // Add to following/followers
      await Promise.all([
        User.findByIdAndUpdate(followerId, {
          $addToSet: { following: followingId }
        }),
        User.findByIdAndUpdate(followingId, {
          $addToSet: { followers: followerId }
        })
      ]);

      // Send notification
      await this.notificationService.sendToUser(followingId, {
        type: 'new_follower',
        title: 'New Follower',
        message: `${follower.first_name} ${follower.last_name} started following you`,
        data: {
          followerId: followerId,
          followerName: `${follower.first_name} ${follower.last_name}`,
          followerPicture: follower.profile_picture
        }
      });

      return {
        success: true,
        follower: followerId,
        following: followingId,
        message: 'Successfully followed user'
      };
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followerId, followingId) {
    try {
      if (followerId.equals(followingId)) {
        throw new Error('Cannot unfollow yourself');
      }

      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new Error('User not found');
      }

      // Check if not following
      if (!follower.following.includes(followingId)) {
        throw new Error('Not following this user');
      }

      // Remove from following/followers
      await Promise.all([
        User.findByIdAndUpdate(followerId, {
          $pull: { following: followingId }
        }),
        User.findByIdAndUpdate(followingId, {
          $pull: { followers: followerId }
        })
      ]);

      return {
        success: true,
        follower: followerId,
        following: followingId,
        message: 'Successfully unfollowed user'
      };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async addConnection(userId, connectionId, strength = 0.5, type = 'professional') {
    try {
      if (userId.equals(connectionId)) {
        throw new Error('Cannot connect to yourself');
      }

      const [user, connection] = await Promise.all([
        User.findById(userId),
        User.findById(connectionId)
      ]);

      if (!user || !connection) {
        throw new Error('User not found');
      }

      // Check if connection already exists
      const existingConnection = user.connections.find(
        conn => conn.user_id.equals(connectionId)
      );

      if (existingConnection) {
        // Update existing connection
        await User.findByIdAndUpdate(userId, {
          $set: {
            'connections.$[elem].strength': strength,
            'connections.$[elem].type': type,
            'connections.$[elem].updated_at': new Date()
          }
        }, {
          arrayFilters: [{ 'elem.user_id': connectionId }]
        });
      } else {
        // Add new connection
        await User.findByIdAndUpdate(userId, {
          $push: {
            connections: {
              user_id: connectionId,
              strength,
              type,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        });
      }

      // Add reverse connection
      const reverseConnection = connection.connections.find(
        conn => conn.user_id.equals(userId)
      );

      if (!reverseConnection) {
        await User.findByIdAndUpdate(connectionId, {
          $push: {
            connections: {
              user_id: userId,
              strength,
              type,
              created_at: new Date(),
              updated_at: new Date()
            }
          }
        });
      }

      // Send notification
      await this.notificationService.sendToUser(connectionId, {
        type: 'new_connection',
        title: 'New Connection',
        message: `${user.first_name} ${user.last_name} connected with you`,
        data: {
          userId: userId,
          userName: `${user.first_name} ${user.last_name}`,
          userPicture: user.profile_picture,
          connectionType: type
        }
      });

      return {
        success: true,
        userId,
        connectionId,
        strength,
        type,
        message: 'Connection added successfully'
      };
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  }

  async updateConnectionStrength(userId, connectionId, newStrength) {
    try {
      if (newStrength < 0 || newStrength > 1) {
        throw new Error('Connection strength must be between 0 and 1');
      }

      const [user, connection] = await Promise.all([
        User.findById(userId),
        User.findById(connectionId)
      ]);

      if (!user || !connection) {
        throw new Error('User not found');
      }

      // Update connection strength for both users
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $set: {
            'connections.$[elem].strength': newStrength,
            'connections.$[elem].updated_at': new Date()
          }
        }, {
          arrayFilters: [{ 'elem.user_id': connectionId }]
        }),
        User.findByIdAndUpdate(connectionId, {
          $set: {
            'connections.$[elem].strength': newStrength,
            'connections.$[elem].updated_at': new Date()
          }
        }, {
          arrayFilters: [{ 'elem.user_id': userId }]
        })
      ]);

      return {
        success: true,
        userId,
        connectionId,
        newStrength,
        message: 'Connection strength updated successfully'
      };
    } catch (error) {
      console.error('Error updating connection strength:', error);
      throw error;
    }
  }

  async removeConnection(userId, connectionId) {
    try {
      if (userId.equals(connectionId)) {
        throw new Error('Cannot remove connection to yourself');
      }

      const [user, connection] = await Promise.all([
        User.findById(userId),
        User.findById(connectionId)
      ]);

      if (!user || !connection) {
        throw new Error('User not found');
      }

      // Remove connection from both users
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $pull: { connections: { user_id: connectionId } }
        }),
        User.findByIdAndUpdate(connectionId, {
          $pull: { connections: { user_id: userId } }
        })
      ]);

      return {
        success: true,
        userId,
        connectionId,
        message: 'Connection removed successfully'
      };
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  }

  async getConnections(userId, type = null, limit = 50) {
    try {
      const user = await User.findById(userId)
        .populate('connections.user_id', 'first_name last_name profile_picture reputation_score reputation_level')
        .select('connections');

      if (!user) {
        throw new Error('User not found');
      }

      let connections = user.connections;

      if (type) {
        connections = connections.filter(conn => conn.type === type);
      }

      // Sort by strength and limit
      connections.sort((a, b) => b.strength - a.strength);
      connections = connections.slice(0, limit);

      return connections.map(conn => ({
        userId: conn.user_id._id,
        name: `${conn.user_id.first_name} ${conn.user_id.last_name}`,
        profilePicture: conn.user_id.profile_picture,
        reputationScore: conn.user_id.reputation_score,
        reputationLevel: conn.user_id.reputation_level,
        strength: conn.strength,
        type: conn.type,
        createdAt: conn.created_at,
        updatedAt: conn.updated_at
      }));
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }

  async getFollowers(userId, limit = 50) {
    try {
      const user = await User.findById(userId)
        .populate('followers', 'first_name last_name profile_picture reputation_score reputation_level')
        .select('followers');

      if (!user) {
        throw new Error('User not found');
      }

      const followers = user.followers.slice(0, limit);

      return followers.map(follower => ({
        userId: follower._id,
        name: `${follower.first_name} ${follower.last_name}`,
        profilePicture: follower.profile_picture,
        reputationScore: follower.reputation_score,
        reputationLevel: follower.reputation_level
      }));
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  async getFollowing(userId, limit = 50) {
    try {
      const user = await User.findById(userId)
        .populate('following', 'first_name last_name profile_picture reputation_score reputation_level')
        .select('following');

      if (!user) {
        throw new Error('User not found');
      }

      const following = user.following.slice(0, limit);

      return following.map(followed => ({
        userId: followed._id,
        name: `${followed.first_name} ${followed.last_name}`,
        profilePicture: followed.profile_picture,
        reputationScore: followed.reputation_score,
        reputationLevel: followed.reputation_level
      }));
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }

  async getMutualConnections(userId1, userId2) {
    try {
      const [user1, user2] = await Promise.all([
        User.findById(userId1).select('connections.user_id'),
        User.findById(userId2).select('connections.user_id')
      ]);

      if (!user1 || !user2) {
        throw new Error('User not found');
      }

      const user1Connections = new Set(user1.connections.map(conn => conn.user_id.toString()));
      const user2Connections = new Set(user2.connections.map(conn => conn.user_id.toString()));

      const mutualConnectionIds = [...user1Connections].filter(id => user2Connections.has(id));

      if (mutualConnectionIds.length === 0) {
        return [];
      }

      const mutualUsers = await User.find({
        _id: { $in: mutualConnectionIds }
      }).select('first_name last_name profile_picture reputation_score reputation_level');

      return mutualUsers.map(user => ({
        userId: user._id,
        name: `${user.first_name} ${user.last_name}`,
        profilePicture: user.profile_picture,
        reputationScore: user.reputation_score,
        reputationLevel: user.reputation_level
      }));
    } catch (error) {
      console.error('Error getting mutual connections:', error);
      throw error;
    }
  }

  async getConnectionPath(userId1, userId2, maxDepth = 3) {
    try {
      if (userId1.equals(userId2)) {
        return { path: [], distance: 0 };
      }

      const visited = new Set();
      const queue = [{ userId: userId1, path: [], distance: 0 }];

      while (queue.length > 0) {
        const { userId, path, distance } = queue.shift();

        if (distance > maxDepth) {
          continue;
        }

        if (userId.equals(userId2)) {
          return { path, distance };
        }

        if (visited.has(userId.toString())) {
          continue;
        }

        visited.add(userId.toString());

        const user = await User.findById(userId).select('connections.user_id');
        if (!user) continue;

        for (const connection of user.connections) {
          if (!visited.has(connection.user_id.toString())) {
            const newPath = [...path, connection.user_id];
            queue.push({
              userId: connection.user_id,
              path: newPath,
              distance: distance + 1
            });
          }
        }
      }

      return { path: [], distance: -1 };
    } catch (error) {
      console.error('Error getting connection path:', error);
      throw error;
    }
  }

  async getSocialRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId)
        .populate('connections.user_id', '_id')
        .select('connections connections.user_id following followers');

      if (!user) {
        throw new Error('User not found');
      }

      const connectedUserIds = new Set([
        ...user.connections.map(conn => conn.user_id._id.toString()),
        ...user.following.map(id => id.toString()),
        ...user.followers.map(id => id.toString())
      ]);

      // Find users with similar interests or location
      const recommendations = await User.find({
        _id: { $ne: userId, $nin: [...connectedUserIds] },
        $or: [
          { location: user.location },
          { occupation: user.occupation },
          { education: user.education }
        ]
      })
      .select('first_name last_name profile_picture reputation_score reputation_level location occupation education')
      .sort({ reputation_score: -1 })
      .limit(limit);

      return recommendations.map(rec => ({
        userId: rec._id,
        name: `${rec.first_name} ${rec.last_name}`,
        profilePicture: rec.profile_picture,
        reputationScore: rec.reputation_score,
        reputationLevel: rec.reputation_level,
        location: rec.location,
        occupation: rec.occupation,
        education: rec.education
      }));
    } catch (error) {
      console.error('Error getting social recommendations:', error);
      throw error;
    }
  }

  async getSocialStats(userId) {
    try {
      const user = await User.findById(userId)
        .select('followers following connections');

      if (!user) {
        throw new Error('User not found');
      }

      const connectionTypes = {};
      if (user.connections) {
        user.connections.forEach(conn => {
          connectionTypes[conn.type] = (connectionTypes[conn.type] || 0) + 1;
        });
      }

      return {
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        totalConnections: user.connections?.length || 0,
        connectionTypes,
        socialScore: this.calculateSocialScore(user)
      };
    } catch (error) {
      console.error('Error getting social stats:', error);
      throw error;
    }
  }

  calculateSocialScore(user) {
    let score = 0;

    // Followers and following
    score += Math.min(user.followers?.length || 0, 100) * 2;
    score += Math.min(user.following?.length || 0, 50) * 1;

    // Connections
    const strongConnections = user.connections?.filter(conn => conn.strength >= 0.8) || [];
    const mediumConnections = user.connections?.filter(conn => conn.strength >= 0.5 && conn.strength < 0.8) || [];
    
    score += strongConnections.length * 10;
    score += mediumConnections.length * 5;

    return Math.min(score, 1000);
  }
}

module.exports = SocialService;
