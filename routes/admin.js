router.post(
    "/application/:id/status",
    authMiddleware.isLoggedIn,
    applicationController.updateStatus
);

