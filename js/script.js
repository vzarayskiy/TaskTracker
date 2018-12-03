
$(document).ready(function () {

    $('#dropdownMenuButton  > li > a').click(function (e) {

    });



    $("#input-name").autocomplete({
        delay: 0,
        source: function (event, ui) {
            $.ajax({
                url: "http://localhost/tasklist/getnonmembers",
                type: "POST",
                data: {name: $('.task-title').html()},
                success: function (data, textStatus, jqXHR) {
                    var $json = JSON.parse(data);
                    console.log($json);
                    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(event.term), "i");
                    ui($.grep($json, function (item) {
                        return matcher.test(item);
                    }));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
                }
            });
        },
        select: function (event, ui) {
            $("#input-name").val(ui.value);
            event.stopPropagation();
        }
    });


    var $taskDescriptionOld;


// Добавление новой задачи
    $("#add").click(function (e) {
        //  e.preventDefault();
        var $taskname = $('#task-name').val().trim();
        if ($taskname === '') {
            alert("Пустая строка");
            return false;
        }
        $.ajax({
            url: "http://localhost/tasklist/addtask",
            type: "POST",
            data: {name: $taskname},
            success: function (data, textStatus, jqXHR) {
                $('.container-fluid').append('<div class="card text-white bg-primary mb-3" style="max-width: 18rem;">\n\
        <input type="button" class="card-header btn btn-primary task newtask" data-toggle="modal" data-target="#edit-Task" \n\
        data-backdrop="static" data-keyboard="false" value="' + data + '"/></div>');
                $('.newtask').click(function (e) {
                    e.preventDefault();
                    $('.task-title').html(this.value);
                    $.ajax({
                        url: "http://localhost/tasklist/gettaskinfo",
                        type: "POST",
                        data: {name: $('.task-title').html()},
                        success: function (data, textStatus, jqXHR) {
                            var $json = JSON.parse(data);
                            console.log($json);
                            $('#description').val($json.description);
                            $('input[name="begin"]').val($json.date_begin);
                            $('input[name="end"]').val($json.date_end);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
                        }
                    });
                });
                $('.newtask').removeClass('newtask');
                $('#add-Task').modal('toggle');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
        return false;
    });
//изменение описания
    $("#change-desc-submit").click(function (e) {
        e.preventDefault();
        var $taskDescriptionNew = $('#description').val().trim();
        $.ajax({
            url: "http://localhost/tasklist/changetaskdescription",
            type: "POST",
            data: {name: $('.task-title').html(),
                desc: $taskDescriptionNew},
            success: function (data, textStatus, jqXHR) {
                changeState();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
        return false;
    });
//добавление комментария
    $("#add-comment-submit").click(function (e) {
        e.preventDefault();
        var $comment = $('#comment').val().trim();
        $.ajax({
            url: "http://localhost/tasklist/addcomment",
            type: "POST",
            data: {name: $('.task-title').html(),
                comm: $comment},
            success: function (data, textStatus, jqXHR) {
                var $json = JSON.parse(data);
                $('.comments').append('<div class="form-group added-comment">' +
                        '<p ><b>' + $json.users.login + '</b></p>' +
                        '<p>' + timeConverter($json.time) + '</p></br>' +
                        '<p>' + $json.comment + '</p>' +
                        '</div>');
                $('.comments').scrollTop($('.comments').children().length * 70);
                $('#comment').val("");
                $('#comment').focus();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
        return false;
    });
//добавление нового участница
    $(".add-new-member").click(function (e) {
        e.preventDefault();
        var $member = $('#input-name').val().trim();
        $.ajax({
            url: "http://localhost/tasklist/addnewmember",
            type: "POST",
            data: {name: $('.task-title').html(),
                mem: $member},
            success: function (data, textStatus, jqXHR) {
                var $json = JSON.parse(data);               
                    $('#list').append('<div class="member">' +
                            '<span class="member-initials" title="' + $json.mem + '">' + $json.mem.charAt(0).toUpperCase() + '</span>' +
                            '</div>');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
        return false;
    });
//просмотреть информацию о задаче
    $(".task").click(function (e) {
        e.preventDefault();
        $('#description').val("");
        $('input[name="begin"]').val("");
        $('input[name="end"]').val("");
        $('.added-comment').remove();
        $('.member').remove();
        $('.priority-select option:selected').each(function () {
            this.selected = false;
        });
        $('.task-title').html(this.value);
        $.ajax({
            url: "http://localhost/tasklist/gettaskinfo",
            type: "POST",
            data: {name: $('.task-title').html()},
            success: function (data, textStatus, jqXHR) {
                var $json = JSON.parse(data);
                console.log($json);
                $('#description').val($json.description);
                $('input[name="begin"]').val($json.date_begin);
                $('input[name="end"]').val($json.date_end);
                $json.ownComments.forEach(function (item, i, arr) {
                    $('.comments').append('<div class="form-group added-comment">' +
                            '<p ><b>' + item.users.login + '</b></p>' +
                            '<p>' + timeConverter(item.time) + '</p></br>' +
                            '<p>' + item.comment + '</p>' +
                            '</div>');
                });
                $(".priority-select").removeClass("btn-primary btn-success btn-warning btn-danger");
                $(".priority-select").addClass($json.priority);
                $(".priority-select option[value='" + $json.priority + "']").attr("selected", "selected");
                $json.sharedUsers.forEach(function (item, i, arr) {
                    $('#list').append('<div class="member">' +
                            '<span class="member-initials" title="' + item.login + '">' + item.login.charAt(0).toUpperCase() + '</span>' +
                            '</div>');
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
    });
//очистка полей
    $("#task-close-but").click(function (e) {
        e.preventDefault();
        changeState();
    });
//очистка поля имени задачи
    $("#add-task-but").click(function (e) {
        e.preventDefault();
        $('#task-name').val("");
    });
//выбор приоритета    
    $(".priority-select").change(function (e) {
        e.preventDefault();
        $(".priority-select").removeClass("btn-primary btn-success btn-warning btn-danger");
        $(".priority-select").addClass($(".priority-select").select().val());
        $.ajax({
            url: "http://localhost/tasklist/changepriority",
            type: "POST",
            data: {name: $('.task-title').html(),
                prior: $(".priority-select").select().val()},
            success: function (data, textStatus, jqXHR) {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
        return false;
    });
//изменения даты окончания
    $('input[name="end"]').change(function (e) {
        e.preventDefault();
        $.ajax({
            url: "http://localhost/tasklist/changeenddate",
            type: "POST",
            data: {name: $('.task-title').html(),
                date: $('input[name="end"]').val()},
            success: function (data, textStatus, jqXHR) {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText + '|\n' + textStatus + '|\n' + errorThrown);
            }
        });
    });
//изменения состояния редактирования описания    
    $("#change-desc").click(function (e) {
        e.preventDefault();
        $taskDescriptionOld = $('#description').val();
        $('#change-desc-submit').removeAttr('hidden');
        $('#cancel-desc').removeAttr('hidden');
        $('#description').attr('disabled', false);
        $('#description').css('border', '1px solid #ced4da');
        $("#change-desc").attr('hidden', true);
        return false;
    });
//изменения состояния редактирования описания  
    $("#cancel-desc").click(function (e) {
        e.preventDefault();
        $('#description').val($taskDescriptionOld);
        changeState();
        return false;
    });
//отмена редактирования
    function changeState() {
        $('#change-desc-submit').attr('hidden', true);
        $('#change-desc').removeAttr('hidden');
        $('#description').attr('disabled', true);
        $('#description').css('border', 'none');
        $("#cancel-desc").attr('hidden', true);
    }

//перевод времени из UNIX в привычный формат
    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;
        return time;
    }
});
