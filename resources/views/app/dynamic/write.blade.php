<!doctype html>
<html lang="en">

<link rel="stylesheet" type="text/css" href="lib/wangEditor/css/wangEditor.min.css">


<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>新文章</title>

    <style>

        a {

            text-decoration: none;
        }

        #title {

            width: 100%;
            height: 50px;
            margin: 10px auto;
            outline: none;
            border: 0;
            border-bottom: 1px solid #ccc;
            font-size: 20px;
            font-family: "Songti SC";
            color: #111;
            font-weight: 900;
            text-align: center;

        }

        .nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #f8f8f8;

            height: 50px;
        }

        .nav div {

            margin: 15px 50px;
        }

        .logo {

            color: green;
            font-size: large;
        }

        .btn {
            background-color: orange;
            padding: 5px 20px;
            border-radius: 5px;
            color: white;
            margin: auto 15px;
        }

        #sub_btn {

            background-color: #04b03c;

        }


    </style>

</head>
<body>

<div class="nav">

    <div style="float: left">
        <a class="logo" href="{{url('')}}">AGoodMan</a>
        <span style="margin-left: 10px;color: #bd3a55;">新文章</span>
    </div>

    <div style="float: right">
        <a class="btn" id="clear_btn" href="javascript:void (0);">清空</a>
        <a class="btn" id="sub_btn" href="javascript:void (0);">发表</a>
    </div>

</div>

<div style="width: 80%;margin: 50px auto">

    <form method="post" action="{{url('dynamic')}}" id="article_form">

        {{csrf_field()}}
        <input type="text" hidden name="dynamic_type" value="article">
        <input type="text" hidden name="img_keys" id="img_keys">


        <input id="title" type="text" name="article_title" placeholder="请输入标题">
        <textarea hidden name="article_content" id="article_content"></textarea>


        <div id="div1" style="height: 600px">
            <p>请输入内容...</p>
        </div>
    </form>

</div>
</body>

<!--引入jquery和wangEditor.js-->   <!--注意：javascript必须放在body最后，否则可能会出现问题-->
<script src="http://cdn.bootcss.com/jquery/3.2.0/jquery.min.js"></script>
<script src="/js/app.js"></script>
<script type="text/javascript" src="lib/wangEditor/js/wangEditor.min.js"></script>
<script src="{{url('lib/layer/layer.js')}}"></script>


<!--这里引用jquery和wangEditor.js-->
<script type="text/javascript">
    var editor = new wangEditor('div1');
    var img_keys = $("#img_keys");

    editor.config.menus = $.map(wangEditor.config.menus, function (item, key) {
        if (item === 'video' || item === 'location') {
            return null;
        }

        return item;
    });


    editor.config.emotions = {
        // 支持多组表情
        // 第一组，id叫做 'default'
        'default': {
            title: '默认',  // 组名称
            data: 'http://www.wangeditor.com/wangEditor/test/emotions.data'  // 服务器的一个json文件url，例如官网这里配置的是 http://www.wangeditor.com/wangEditor/test/emotions.data
        }


    };


    // 上传图片（举例）
    editor.config.uploadImgUrl = '/upload';

    // 配置自定义参数（举例）
    editor.config.uploadParams = {

        'inputName': 'wangEditorImg',
        'action': 'dynamicImgUpload',
        'key': randomString(32),
        '_token': '{{csrf_token()}}'
    };
    editor.config.uploadImgFileName = 'wangEditorImg';
    editor.config.uploadImgFns.onload = function (responseData, xhr) {
        // resultText 服务器端返回的text
        // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
        var data;
        try {
            data = $.parseJSON(responseData);
            //console.log(data);
        } catch (err) {
            data = responseData;
        }
        if (data.state == 0) {
            // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
            var originalName = editor.uploadImgOriginalName || '';
            var key = data.key;

            var value = img_keys.val();

            if (value.length >= 1) {
                value = value + '|' + key
            } else {
                value = key;
            }
            img_keys.val(value);
            //console.log(data.key);
            // 如果 resultText 是图片的url地址，可以这样插入图片：
            editor.command(null, 'insertHtml', '<img src="' + data.url + '" alt="' + originalName + '" style="max-width:100%;"/>');

        } else {

            alert('上传失败' + data.msg);
        }

        this.config.uploadParams.key = randomString(32);

    };

    // 设置 headers（举例）
    editor.config.uploadHeaders = {
        'Accept': 'text/x-json'
    };


    editor.create();
</script>

<script>
    var subBtn = $("#sub_btn");
    var clearBtn = $("#clear_btn");
    var title = $("#title");

    subBtn.click(function () {

        var html = editor.$txt.html();          // 获取容
        var text = editor.$txt.text();          //获取纯文本
        var titleVal = title.val();

        var titleLength = getObjLength(titleVal);
        var textLength = getObjLength(text);

        if (titleLength > 35) {

            layer.msg('标题太长啦,人家不要嘛', {icon: 5});
            return 0;

        } else if (titleLength < 3) {

            layer.msg('老师说标题至少要3个字符哦', {icon: 5});
            return 0;
        }

        if (getObjLength(title) > 35) {

            layer.msg('标题太长啦,人家不要嘛', {icon: 5});
            return 0;

        }

        if (textLength < 20) {

            layer.msg('再多写写哦,20个字符都不到诶', {icon: 5});
            return 0;

        }

        if (textLength > 3500) {

            layer.msg('你写得太多了哦', {icon: 5});
            return 0;
        }

        $("#article_content").val(html);
        $("#article_form").submit();

    });


    clearBtn.click(function () {

        layer.confirm('你确定要清空么?', {
            btn: ['是的', '不要'] //按钮
        }, function () {
            editor.$txt.html('<p><br></p>');
            layer.closeAll('dialog');
        }, function () {

        });

    });

    $("#div1").one('click', function () {

        editor.$txt.html('<p><br></p>');

    });
</script>
</html>