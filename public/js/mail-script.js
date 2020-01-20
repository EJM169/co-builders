    // -------   Mail Send ajax

     $(document).ready(function() {
        var form = $('#myForm'); // contact form
        var submit = $('.submit-btn'); // submit button
        var alert = $('.alert-msg'); // alert div for show alert message
        var for_pass=$('#for_pass'); //Forgot password button
        var for_pop=$('#for_pop'); //Forgot password body
        var close=$('#close');
        var custpass1=$('#cust_pass1');
        var custpass2=$('#cust_pass2');
        var pass_match1=$('#pass_match1');
        var contpass1=$('#cont_pass1');
        var contpass2=$('#cont_pass2');
        var pass_match2=$('#pass_match2');



        // form submit event
        form.on('submit', function(e) {
            e.preventDefault(); // prevent default form submit

            $.ajax({
                url: 'mail.php', // form action url
                type: 'POST', // form submit method get/post
                dataType: 'html', // request type html/json/xml
                data: form.serialize(), // serialize form data
                beforeSend: function() {
                    alert.fadeOut();
                    submit.html('Sending....'); // change submit button text
                },
                success: function(data) {
                    alert.html(data).fadeIn(); // fade in response data
                    form.trigger('reset'); // reset form
                    submit.attr("style", "display: none !important");; // reset submit button text
                },
                error: function(e) {
                    console.log(e)
                }
            });
        });

    for_pass.click(function(){
        for_pop.fadeIn(500);
    })
    close.click(function(){
        for_pop.fadeOut(500);
    })
    custpass2.keyup(function(){
        if(custpass1.val() != custpass2.val()){
            pass_match1.fadeIn(500);
        }
        else{
            pass_match1.fadeOut(500);
        }
        return true;
    })
    contpass2.keyup(function(){
        console.log(custpass1.val());
        if(contpass1.val() != contpass2.val()){
            pass_match2.fadeIn(500);
        }
        else{
            pass_match2.fadeOut(500);
        }
        return true;
    })
    });