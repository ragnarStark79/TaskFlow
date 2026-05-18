const express = require('express');
const router = express.Router();
const {
    createWorkspace,
    getWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    requestJoinWorkspace,
    getJoinRequests,
    approveJoinRequest,
    denyJoinRequest,
    updateMemberRole,
    removeMember
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

// All workspace routes are tightly protected
router.use(protect);

router.route('/')
    .get(getWorkspaces)
    .post(createWorkspace);

router.route('/:id')
    .put(updateWorkspace)
    .delete(deleteWorkspace);

router.route('/:id/join-requests')
    .post(requestJoinWorkspace)
    .get(getJoinRequests);

router.route('/:id/join-requests/:requestId/approve')
    .post(approveJoinRequest);

router.route('/:id/join-requests/:requestId/deny')
    .delete(denyJoinRequest);

router.route('/:id/members/:memberId')
    .put(updateMemberRole)
    .delete(removeMember);

module.exports = router;
