function skillsMember() {
    var skills = document.getElementsByClassName('skillsMember');
    for (var i = 0; i < skills.length; i++) {
        var skill = skills[i];
        var skillName = skill.getElementsByClassName('skillName')[0].innerText;
        var skillValue = skill.getElementsByClassName('skillValue')[0].innerText;
        var skillBar = skill.getElementsByClassName('skillBar')[0];
        skillBar.style.width = skillValue;
    }
}