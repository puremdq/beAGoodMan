(function ($) {

    $.fn.comment = function (commentList, options) {


        var settings = $.extend({

            'commentUrl': 'comment',
            'getCommentUrl': 'comment',
            'targetId': 1

        }, options);


        function initialize() {

            $(commentList).append('<div class="normal-comment-list comment-list-wrapper "></div>');
            var normalCommentList = $(commentList).find(".normal-comment-list");

            normalCommentList
                .append('<input hidden="hidden" class="page" value="1">')
                .append('<input hidden="" class="offset" value="0">')
                .append('<div class="just-comment-list"></div><!--��������-->')
                .append('<a class="load-more load-more-0">���ظ���</a><!--���ظ���-->');


            var newCommentWrapper = $(".for-clone").find('.new-comment-wrapper');
            if (newCommentWrapper.length > 0) {

                newCommentWrapper = newCommentWrapper.clone();
                $(normalCommentList).append(newCommentWrapper);
                setAddCommentEvent(newCommentWrapper);
            }


            $(normalCommentList).children(".load-more").click();

            return normalCommentList;

        }


        var normalCommentList = initialize();

        /*Ϊ������������������ DOM��������¼�*/
        function setAddCommentEvent(thiss) {

            var type;

            if ($(thiss).hasClass('reply-comment-wrapper')) {

                type = 1;//�ظ�����(�������۵�����)

            } else {

                type = 0;//�������

            }

            var textarea = $(thiss).find('.new-comment-textarea');
            var writeFunctionBlock = $(thiss).find('.write-function-block');
            var newCommentForm = $(thiss).find('.new-comment-form');

            $(thiss).find('.emoji').SinaEmotion(textarea);

            $(thiss).find('.cancel').click(function () {

                if (type === 1) {

                    /*�ظ����۵�����*/
                    $(thiss).addClass('hide');

                    /* if ($(newCommentForm).parents(".add-comment").prev('.just-comment-list').children(".sub-comment").length < 1) {
                     $(newCommentForm).parents('.sub-comment-list').addClass('hide');
                     }*/


                } else if (type === 0) {

                    $(textarea).val('');
                    $(writeFunctionBlock).hide();

                }

            });

            $(textarea).click(function () {

                $(writeFunctionBlock).show();
            });


            $(newCommentForm).on('submit', function (e) {


                if (!isLogin()) {
                    return false;
                }

                e.preventDefault();//ȡ��Ĭ�ϲ���

                if ($(newCommentForm).find('.btn-send').hasClass('disabled') || getObjLength(textarea) < 1) {

                    alertMessage('�����������', 0);

                } else {

                    /*��� ���۵���̨ ������dom*/
                    var formData = new FormData($(newCommentForm)[0]);
                    $.ajax({
                        url: settings.commentUrl,
                        data: formData,
                        dataType: 'json',
                        type: 'post',
                        processData: false,
                        contentType: false,
                        success: function (resp) {

                            if (resp.state == 0) {

                                insertComment(resp, resp.comment_pid, 1);//�����۲���

                                $(newCommentForm).find('.cancel').click();

                                $(newCommentForm.find('.new-comment-textarea')).val('');

                                //����offset
                                var commentListDom, offset, offsetVal;
                                if (type === 0) {

                                    commentListDom = $(newCommentForm).parents(".normal-comment-list");

                                    var commentNumDom = $(".comment-num");
                                    $(commentNumDom).html(parseInt($(commentNumDom).html()) + 1);

                                } else {
                                    commentListDom = $(newCommentForm).parents(".sub-comment-list");

                                    var replyNumDom = $(commentListDom).parents(".comment-wrapper").find(".reply-num");
                                    var replyNumVal = $(replyNumDom).html();

                                    replyNumVal = replyNumVal == '�ظ�' ? 0 : parseInt(replyNumVal);
                                    replyNumDom.html(replyNumVal + 1);


                                }


                                offset = $(commentListDom).children(".offset");
                                offsetVal = parseInt(offset.val());
                                $(offset).val(offsetVal + 1);
                                //end ���� offset

                                alertMessage('���۳ɹ�', 1);

                            } else {

                                alertMessage(resp.msg, -1);

                            }
                        }

                    });


                }
            });

        }

        /*���ظ�������*/
        $(normalCommentList).on('click', '.load-more', function () {

            var thiss = $(this);

            var pageDom, pageVal, commentListDom, pid;

            if (thiss.hasClass("load-more-0")) {

                commentListDom = normalCommentList;
                pid = 0;

            } else if (thiss.hasClass("load-more-1")) {

                commentListDom = thiss.parents(".sub-comment-list");

                pid = commentListDom.parent(".comment").attr('comment_id');

            }

            pageDom = $(commentListDom).children(".page");
            pageVal = parseInt(pageDom.val());

            setCommentDom(pid, pageVal);

            pageDom.val(pageVal + 1);


        });


        /*����ظ� �����ָ���*/
        $(normalCommentList).on('click', '.reply-comment', function () {


            if (!isLogin()) {
                return false;
            }

            var current = $(this);


            /*type 0 ��ʾ������� ���� �� �ظ�  1��ʾ������� ���۵����� �� �ظ�*/
            var type = $(current).hasClass('reply-comment1') ? 1 : 0;


            var commentDom = $(current).parents('.comment');

            var commentPid = commentDom.attr('comment_id');//�õ�id
            var subCommentList = $(commentDom).find('.sub-comment-list');


            var newReplyComment = $("#comment-list").find('.reply-comment-wrapper');//�����������򲿷�

            newReplyComment.removeClass("hide");

            var commentTextarea = $(newReplyComment).find('.new-comment-textarea');

            if (type === 0) {

                $(subCommentList).prepend(newReplyComment);
                $(commentTextarea).val('');


            } else if (type === 1) {

                commentTextarea.val("@" + commentDom.find(".comment-user").html() + " ");
                $(current).parents(".sub-comment").append(newReplyComment);

            }

            $(commentDom).find('.comment-pid').val(commentPid);//����form pid
            subCommentList.removeClass('hide');
            newReplyComment.removeClass('hide');
            commentDom.find('.pack-up').attr('is-pack-up', 'false');
            $(commentTextarea).click();

        });


        /**
         *�������۵�����,�������뵽DOM�к��ʵ�λ��
         *����λ�� 0�Ӻ������  1��ǰ�����
         */
        function insertComment(data, pid, insertLocation) {

            var type = pid;

            type = (type > 0) ? 1 : 0;

            var commentsPlaceholder;
            var commentObj;

            var justCommentList;

            if (type === 0) {

                commentsPlaceholder = $(".for-clone").find("#comment-placeholder").clone();

                justCommentList = $("#comment-list").find('.just-comment-list')[0];


            } else if (type === 1) {

                var commentDom = $("#comment-" + pid);
                commentsPlaceholder = $(".for-clone").find("#sub-comment-placeholder").clone();
                justCommentList = $(commentDom).find('.just-comment-list');

            }

            commentObj = setComment(commentsPlaceholder, data, type);


            if (insertLocation === 0) {

                $(justCommentList).append(commentObj);

            } else if (insertLocation === 1) {


                $(justCommentList).prepend(commentObj);


            }


            if ($(justCommentList).parent(".hide").length > 0) {

                $(justCommentList).parent(".hide").removeClass("hide");

            }

            analyticShowTime(commentObj.find('.time')); // ����ʱ��
            analyticTargetEmotion(commentObj.find('.content'));//��������*!/

        }


        /**
         * ������������װ������dom���� ������
         * */
        function setComment(commentsPlaceholder, data, type) {


            commentsPlaceholder.attr('user_id', data.user_id);
            commentsPlaceholder.addClass("comment-wrapper");

            if (type === 0) {

                var avatar = commentsPlaceholder.find('.avatar');//ͷ��
                var content = commentsPlaceholder.find('.content');//��������
                var likeNum = commentsPlaceholder.find('.like-num');//������
                var replyNum = commentsPlaceholder.find('.reply-num');//�ظ���

                avatar.children("img").attr('src', "/getfile?key=" + data.avatar_key);
                avatar.attr('href', "/u/" + data.user_id);
                commentsPlaceholder.find('.name').html(data.username).attr('href', "/u/" + data.user_id);
                commentsPlaceholder.find('.time').attr('data-shared-at', data.comment_time);
                content.html(data.comment_content);

                likeNum.html((parseInt(data.like_num) == 0) ? '��' : data.like_num);
                replyNum.html((parseInt(data.reply_num) == 0) ? '�ظ�' : data.reply_num);

                commentsPlaceholder.attr('id', 'comment-' + data.comment_id);


            } else if (type === 1) {

                var commentUser = commentsPlaceholder.find('.comment-user');
                var maleskineAuthor = commentsPlaceholder.find(".maleskine-author");


                $(commentUser).attr('href', "/u/" + data.user_id);
                $(commentUser).html(data.username);
                commentsPlaceholder.find('.time').attr('data-shared-at', data.comment_time);
                commentsPlaceholder.attr('id', 'comment-' + data.comment_id);

                if (data.comment_content[0] == "@") {

                    var str = data.comment_content;
                    var username = str.substring(1, str.indexOf(' ') + 1);

                    $(maleskineAuthor).attr('href', "/u/" + username);


                    $(maleskineAuthor).html('@' + username);

                    $(maleskineAuthor).after(str.substring(str.indexOf(' ') + 1));


                } else {
                    maleskineAuthor.parent().html(data.comment_content);

                }
            }

            return commentsPlaceholder;

        }


        /**��������������۲������۲��뵽htmlҳ����
         * @param int pid ��������۵�pid
         * *setComment()*/
        function setCommentDom(pid, page) {

            var offsetDom, offsetVal;

            pid = (pid === undefined) ? 0 : parseInt(pid);

            //printLog(pid);

            offsetDom = (pid === 0) ? $(normalCommentList).children('.offset') : $("#comment-" + pid).find('.offset');
            offsetVal = parseInt(offsetDom.val());

            $.ajax({
                url: settings.getCommentUrl,
                data: {
                    dynamic_id: settings.targetId,
                    comment_pid: pid,
                    page: page,
                    offset: offsetVal
                },
                dataType: 'json',
                type: 'get',
                success: function (resp) {

                    if (resp.state != 0) {

                        alertMessage('�޷���������', -1);
                        return false;

                    }

                    var commentList = resp.commentList;

                    for (var i = 0; i < commentList.length; i++) {

                        insertComment(commentList[i], pid, 0);

                        if (parseInt(commentList[i].reply_num) > 0) {

                            // setCommentDom(commentList[i].comment_id);
                            $("#comment-" + commentList[i].comment_id).find(".load-more").click();
                            $("#comment-" + commentList[i].comment_id).find('.pack-up').attr('is-pack-up', 'false')

                        }

                    }


                    if (pid === 0) {

                        if (resp.isAll == 1) {
                            /*�Ѿ�������*/

                            var newCommentTips = $(".new-comment-tips");
                            newCommentTips.find(".load-more").addClass('hide');
                            newCommentTips.find(".all-complete-tip").removeClass('hide');
                        }

                    } else {

                        var moreCommentTipsDom = $("#comment-" + pid).find(".more-comment");

                        if (resp.isAll != 1) {

                            $(moreCommentTipsDom).removeClass('hide');

                        } else {
                            $(moreCommentTipsDom).addClass("hide");
                        }

                    }

                }
            });
        }


    };
})(jQuery);