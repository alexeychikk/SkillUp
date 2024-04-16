(function() {
    var buildRep = '/dist';

    var templates = {
        competences: {
            templateUrl: buildRep + '/competences/competences.html',
            controller: 'CompetencesController' },

        /* Directives templates */
        likeButton: { templateUrl: buildRep + '/components/buttons/like-button.directive.html' },
        receiveButton: { templateUrl: buildRep + '/components/buttons/receive-button.directive.html' },
        skillButton: { templateUrl: buildRep + '/components/buttons/skill-button.directive.html' },
        comments: { templateUrl: buildRep + '/components/widgets/comments.directive.html' },
        notification: { templateUrl: buildRep + '/components/widgets/notification.directive.html' },
        solutionsList: { templateUrl: buildRep + '/components/widgets/solutions-list.directive.html' },
        tasksList: { templateUrl: buildRep + '/components/widgets/tasks-list.directive.html' },

        loginDialog: {
            templateUrl: buildRep + '/layout/login-dialog.html',
            controller: 'LoginDialogController' },
        createTaskDialog: {
            templateUrl: buildRep + '/main/create-task-dialog.html',
            controller: 'CreateTaskDialogController' },
        main: {
            templateUrl: buildRep + '/main/main.html',
            controller: 'MainController' },
        notifications: {
            templateUrl: buildRep + '/notifications/notifications.html',
            controller: 'NotificationsController' },
        addSkillDialog: {
            templateUrl: buildRep + '/skills/add-skill-dialog.html',
            controller: 'SkillsDialogController' },
        deleteSkillDialog: {
            templateUrl: buildRep + '/skills/delete-skill-dialog.html',
            controller: 'SkillsDialogController' },
        updateSkillDialog: {
            templateUrl: buildRep + '/skills/update-skill-dialog.html',
            controller: 'SkillsDialogController' },
        skills: {
            templateUrl: buildRep + '/skills/skills.html',
            controller: 'SkillsController' },
        allTasks: {
            templateUrl: buildRep + '/tasks/all-tasks.html',
            controller: 'AllTasksController' },
        oneTask: {
            templateUrl: buildRep + '/tasks/one-task.html',
            controller: 'OneTaskController' },
        admin: {
            templateUrl: buildRep + '/users/admin/admin.html',
            controller: 'AdminController' },
        propertyDialog: {
            templateUrl: buildRep + '/users/admin/property-dialog.html',
            controller: 'PropertyDialogController' },
        allUsers: {
            templateUrl: buildRep + '/users/all-users/all-users.html',
            controller: 'AllUsersController' },
        addUserInfoDialog: {
            templateUrl: buildRep + '/users/profile/add-user-info-dialog.html',
            controller: 'AddUserInfoDialogController' },
        profile: {
            templateUrl: buildRep + '/users/profile/profile.html',
            controller: 'ProfileController' },
        registration: {
            templateUrl: buildRep + '/users/registration/registration.html',
            controller: 'RegistrationController' },
        restorePassword: {
            templateUrl: buildRep + '/users/restore-password/restore-password.html',
            controller: 'RestorePasswordController' }
    };

    /* text1 - before user, text2 - before task, text3 - before result */
    var notificationTypes = {
        'your_task_solved': {icon: 'mdi-pencil', title: 'Ваше задание решили'},
        'your_solution_checked': {icon: 'mdi-check', title: 'Ваше решение проверили'},
        'solution_checked': {icon: 'mdi-check', title: 'Проверили решение'},
        'task_approved': {icon: 'mdi-check', title: 'Подтвердили задание'},
        'your_task_approved': {icon: 'mdi-check', title: 'Ваше задание подтвердили'},
        'your_solution_checked_full': {icon: 'mdi-check', title: 'Ваше решение полностью проверено'},
        'solution_checked_full': {icon: 'mdi-check', title: 'Полностью проверено решение'},
        'task_approved_full': {icon: 'mdi-check', title: 'Полностью подтверждено задание'},
        'your_task_approved_full': {icon: 'mdi-check', title: 'Ваше задание полностью подтверждено'},
        'task_liked': {icon: 'mdi-check', title: 'Ваше задание понравилось'},
        'solution_liked': {icon: 'mdi-check', title: 'Ваше решение понравилось'},
        'task_commented': {icon: 'mdi-check', title: 'Ваше задание прокомментировали'},
        'solution_commented': {icon: 'mdi-check', title: 'Ваше решение прокомментировали'},
        'task_received': {icon: 'mdi-check', title: 'Ваше задание взяли'},
        'user_subscribed': {icon: 'mdi-check', title: 'У Вас новый подписчик'},
        'skill_up': {icon: 'mdi-check', title: 'Вы получили новый уровень умения'},
        'comment_liked': {icon: 'mdi-check', title: 'Ваш комментарий понравился'},
        'comment_replied': {icon: 'mdi-check', title: 'На Ваш комментарий ответили'},
        'sub_skill_up': {icon: 'mdi-check', title: 'У Вашего друга новый уровень умения'},
        'sub_task_created_full': {icon: 'mdi-check', title: 'Задание Вашего друга полностью подтверждено'},
        'sub_task_approved_full': {icon: 'mdi-check', title: 'Полностью подтверждено задание'},
        'sub_solution_checked_full': {icon: 'mdi-check', title: 'Полностью проверено решение'},
        'sub_task_solved_full': {icon: 'mdi-check', title: 'Решение Вашего друга полностью проверено'},
        'sub_task_created': {icon: 'mdi-check', title: 'Ваш друг создал задание'},
        'sub_task_approved': {icon: 'mdi-check', title: 'Ваш друг подтвердил задание'},
        'sub_solution_checked': {icon: 'mdi-check', title: 'Ваш друг проверил решение'},
        'sub_task_solved': {icon: 'mdi-check', title: 'Ваш друг решил задание'}
    };

    angular
        .module('skillup')
        .constant('templates', templates)
        .constant('notificationTypes', notificationTypes);
})();