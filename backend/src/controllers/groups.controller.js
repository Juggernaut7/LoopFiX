const { createGroup, joinGroup, listGroups, deleteGroup, getGroupDetails, updateGroup } = require('../services/group.service');
const notificationService = require('../services/notification.service');

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

async function createGroupController(req, res, next) {
  try {
    const { name, description, targetAmount, maxMembers, durationMonths, accountInfo } = req.body;
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;
    const group = await createGroup({ 
      name, 
      description, 
      targetAmount, 
      maxMembers, 
      durationMonths, 
      accountInfo,
      userId 
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error('Create group error:', error);
    next(error);
  }
}

async function joinGroupController(req, res, next) {
  try {
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;
    const group = await joinGroup({ inviteCode: req.body.inviteCode, userId });
    
    // Send notification to group members about new member
    try {
      await notificationService.notifyGroupJoin(group._id, userId);
    } catch (notificationError) {
      console.error('Error sending group join notification:', notificationError);
      // Don't fail the join if notification fails
    }
    
    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

async function listGroupsController(req, res, next) {
  try {
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;
    const groups = await listGroups(userId);
    res.json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
}

async function deleteGroupController(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;

    console.log('️ Deleting group:', groupId, 'by user:', userId);

    const result = await deleteGroup(groupId, userId);
    
    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete group error:', error);
    next(error);
  }
}

async function getGroupDetailsController(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;

    const group = await getGroupDetails(groupId, userId);
    
    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('❌ Get group details error:', error);
    next(error);
  }
}

async function updateGroupController(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.query.walletAddress || req.params.walletAddress || req.body.walletAddress;
    const updateData = req.body;

    console.log('🔄 Updating group:', groupId, 'by user:', userId, 'with data:', updateData);

    const updatedGroup = await updateGroup(groupId, updateData, userId);
    
    res.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    console.error('❌ Update group error:', error);
    next(error);
  }
}


module.exports = { 
  createGroup: createGroupController, 
  joinGroup: joinGroupController, 
  listGroups: listGroupsController,
  deleteGroup: deleteGroupController,
  getGroupDetails: getGroupDetailsController,
  updateGroup: updateGroupController
};