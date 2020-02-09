const forUser = (robot, userId) => {
    const settingsKey = userId + "-settings"
    if (robot.brain.get(settingsKey))
        return robot.brain.get(settingsKey);

    settings = {};
    robot.brain.set(settingsKey, settings);
    return settings;
}

const clearForUser = (robot, userId) => {
    const settingsKey = userId + "-settings"
    robot.brain.set(settingsKey, {});
}

module.exports = {
    forUser,
    clearForUser
}