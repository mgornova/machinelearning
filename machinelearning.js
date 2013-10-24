console.log('Hello');
$(document).ready( function() {
    var y_init, n;
    console.log('Hello');
    $('#btn-submit').on('click', function(e) {
        e.preventDefault(); console.log('Hello2');
        y_init = math.parse($('#func-init').val());
        n = $('.points').val();
        console.log('N = ',n);
        console.log('parse: ', y_init);
    });
});