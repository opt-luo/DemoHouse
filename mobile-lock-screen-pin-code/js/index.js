jQuery(document).ready(function($) {
  $(document).ready(function() {

    // http://www.jsfuck.com/
    var pin = (+!![] + []) + (!+[] + !![] + []) + (!+[] + !![] + !![] + []) + (!+[] + !![] + !![] + !![] + []);
    var enterCode = "";
    enterCode.toString();

    $("#numbers button").click(function() {

      var clickedNumber = $(this).text().toString();
      enterCode = enterCode + clickedNumber;
      var lengthCode = parseInt(enterCode.length);
      lengthCode--;
      $("#fields .numberfield:eq(" + lengthCode + ")").addClass("active");

      if (lengthCode == 3) {

        // Check the PIN
        if (enterCode == pin) {
          // Right PIN!
          $("#fields .numberfield").addClass("right");
          $("#numbers").addClass("hide");
          $("#anleitung p").html("Amazing!<br>You entered the correct Code!");

        } else {
          // Wrong PIN!
          $("#fields").addClass("miss");
          enterCode = "";
          setTimeout(function() {
            $("#fields .numberfield").removeClass("active");
          }, 200);
          setTimeout(function() {
            $("#fields").removeClass("miss");
          }, 500);

        }

      } else {}

    });
    
    $("#restartbtn").click(function(){
      enterCode = "";
      $("#fields .numberfield").removeClass("active");
      $("#fields .numberfield").removeClass("right");
      $("#numbers").removeClass("hide");
      $("#anleitung p").html("<strong>Please enter the correct PIN-Code.</strong><br> It is: 1234 / Also try a wrong code");
    });

  });
});