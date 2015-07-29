/**
 * User: Eric Ma
 * Email: zjafei@gmail.com
 * Date: 2015/5/26
 * Time: 21:54
 */
define(function (require, exports, module) {


    var selectAreaJson = [],
        selectAreaTemp = $('<div style="display:none"></div>'),
        $body = $('body'),
        dialogPlus = require('dialogPlus');

    //创建单个区域html结构
    function createAreaHtml(obj, level, pid) {
        var areaListHtml = '';

        if (typeof obj.son !== "undefined" && obj.son.length > 0) {
            areaListHtml = '<div class="area-list"  i="' + obj.id + '" p="' + pid + '" level="' + level + '"></div>';
            moreHtml = ' <span class="js-select-area-more glyphicon glyphicon-triangle-bottom" i="' + obj.id + '" p="' + pid + '"></span>';
        }
        return '<div class="area-container" level="' + level + '" id="' + obj.id + '" p="' + pid + '">' +
            '<div class="area-head checkbox"  i="' + obj.id + '" p="' + pid + '">' +
            '<span class="select-name js-select-name">' +
            obj.shortname +
            '</span>' +
            moreHtml +
            '</div>' +
            areaListHtml +
            '</div>';
    }

    //创建全部区域html结构
    function createAreaListHtml(areaAry, dom, level, pid) {
        //ajax获取地区json /index.php/Usercenter/Supply/getallarea.html
        $.each(areaAry, function () {
            dom.append(createAreaHtml(this, level, pid));
            if (typeof this.son === "object" && this.son.length > 0) {
                createAreaListHtml(this.son, $('.area-list[i="' + this.id + '"]'), level + 1, this.id);
            }
        });
    }

    //根据修改指定ID的checked属性为true
    function checkedCheckbox(idAry) {
        $('._SELECTIONSELECTAREA .js-select-area').prop('checked', false);
        if (idAry.length > 0) {
            $.each(idAry, function () {
                $('._SELECTIONSELECTAREA .js-select-area[i="' + this + '"]').prop('checked', true);
            });
        }
    }

    //选择框对父级选择框的影响
    function parentCheckbox(pid) {
        if (pid !== '') {
            var allLength = $('._SELECTIONSELECTAREA .area-list[i="' + pid + '"] input[type="checkbox"][p="' + pid + '"]').length;//同级别的全部选择框
            var checkedLenght = $('._SELECTIONSELECTAREA .area-list[i="' + pid + '"] input[type="checkbox"][p="' + pid + '"]:checked').length;//同级别的选中的选择框
            var p = $('._SELECTIONSELECTAREA .js-select-area[i="' + pid + '"]');
            p.prop('checked', allLength === checkedLenght);
            var id = p.attr('p');
            if (id !== '') {//向上迭代父级选择框
                parentCheckbox(id);
            }
        }
    }

    //改变所有数字
    function changeAllNumber(dom) {
        $.each(dom, function () {
            var myThis = $(this);
            var l = myThis.find('.js-select-area:checked').length;
            if (l > 0) {
                $('._SELECTIONSELECTAREA .js-select-area-number[i="' + myThis.attr('i') + '"]').text('(' + l + ')');
            } else {
                $('._SELECTIONSELECTAREA .js-select-area-number[i="' + myThis.attr('i') + '"]').text('');
            }

        });
        // alert(0);
    }

    //获取最末级被选中的选择框的ID数组
    function getLastCheckedAreaIdArray(dom) {
        var ary = [];
        $.each(dom, function () {
            var id = $(this).attr('i');
            //console.log($('#' + id + ' > .area-list').length);
            if ($('._SELECTIONSELECTAREA #' + id + ' > .area-list').length === 0) {
                ary.push(id);
            }
        });
        return ary;
    }

    //获取被选中的选择框的ID数组
    function getAllCheckedAreaIdArray(dom) {
        var ary = [];
        $.each(dom, function () {
            ary.push($(this).attr('i'));
        });
        return ary;
    }

    //获取被选中的选择框的名称数组
    function getAreaNameArray(dom, ary) {
        $.each(dom, function () {
            var myThis = $(this);
            var id = myThis.attr('i');

            if (myThis.prop('checked')) {
                console.log(myThis.parent().text().replace(/\s+/g, ''));
                ary.push(myThis.parent().text().replace(/\s+/g, ''));
            } else {
                var list = $('._SELECTIONSELECTAREA .js-select-area[p ="' + id + '"]');
                if (list.length > 0) {
                    getAreaNameArray(list, ary);
                }
            }
        });
        return ary;
    }

    //城市列表的显示与隐藏
    $body.on('click', '._SELECTIONSELECTAREA .js-select-area-more', function (e) {
        var id = $(this).attr('i');//自己的ID
        var curId = $('._SELECTIONSELECTAREA .cur').eq(0).attr('i');//原来显示的

        if (id === curId) {
            $('._SELECTIONSELECTAREA #' + id).removeAttr('style');
            $('._SELECTIONSELECTAREA .area-list[i="' + id + '"]').removeClass('cur').hide();
        } else {
            $('._SELECTIONSELECTAREA #' + curId).removeAttr('style');
            $('._SELECTIONSELECTAREA .area-list[i="' + curId + '"]').removeClass('cur').hide();
            $('._SELECTIONSELECTAREA .area-list[i="' + id + '"]').addClass('cur').show();
            $('._SELECTIONSELECTAREA #' + id).css({
                'z-index': '99'
            });
        }
        e.stopPropagation();
    });
    $body.on('click', '._SELECTIONSELECTAREA .cur', function (e) {
        e.stopPropagation();
    });
    $body.on('click', '._SELECTIONSELECTAREA .area-container[style="z-index: 99;"] > .area-head > label', function (e) {
        e.stopPropagation();
    });

    $(document).click(function () {
        var curId = $('._SELECTIONSELECTAREA .cur').eq(0).attr('i');//原来显示的
        $('._SELECTIONSELECTAREA #' + curId).removeAttr('style');
        $('._SELECTIONSELECTAREA .area-list[i="' + curId + '"]').removeClass('cur').hide();
    });

    //创建弹窗
    function createselectAreaDialog(dom, cb) {
        //createAreaListHtml(selectAreaJson, selectAreaTemp, 0, '');
        dialogPlus({
            skin:'_SELECTIONSELECTAREA',
            cssUri: seajs.data.base + 'modules/widget/selectionSelectArea/css.css',
            padding: 10,
            content: '<div id="_SELECTIONSELECTAREA">' + selectAreaTemp.html() + '</div>',
            fixed: false,
            quickClose: true,
            width: 500,
            height: 250,
            onbeforeremove: function () {
                selectAreaTemp.html($('#_SELECTIONSELECTAREA').html());
            }
        }).show(dom);

        selectAreaTemp.html('');

        $('._SELECTIONSELECTAREA .area-container[level="0"]:odd ').css({'background-color': '#ECF4FF'});

        //选择框的点击动作
        $('._SELECTIONSELECTAREA .js-select-area').click(function () {
            var id = $(this).attr('i');//自己的ID
            $('.area-list[i="' + id + '"] input[type="checkbox"]').prop('checked', this.checked);//子级全选或全不选
            //parentCheckbox(pid);
            //changeAllNumber($('._SELECTIONSELECTAREA .area-list[level="1"]'));
        });

        $('._SELECTIONSELECTAREA .js-select-name').click(function () {
            cb($(this).parent().attr('i'));
        });
        //changeAllNumber($('._SELECTIONSELECTAREA .area-list[level="1"]'));
    }

    module.exports = function (dom, callback) {
        var cb = function () {
        };

        if (typeof callback === "function") {
            cb = callback;
        }
        $body.append(selectAreaTemp);
        if (selectAreaJson.length > 0) {
            createselectAreaDialog(dom, cb);
        } else {
            $.ajax({
                type: "POST",
                url: APP_PATH + '/Aides/Aides/getbigarea',
                dataType: "json",
                success: function (data) {
                    switch (data.status) {
                        case 1:
                            selectAreaJson = data.arealist;
                            createAreaListHtml(selectAreaJson, selectAreaTemp, 0, '');
                            createselectAreaDialog(dom, cb);
                            break;
                        case 0:
                            alert(data.info);
                            break;
                    }
                }
            });
        }
    };
});