$(document).ready( function() {
    
    var board = JXG.JSXGraph.initBoard('box', {boundingbox:[-1,3,2,-3], axis:true});
    var f, curve; // global objects
    
    function plotter(y_init) {
  var txtraw = y_init;
  f = board.jc.snippet(txtraw, true, 'x', true);
  curve = board.create('functiongraph',[f,
                function(){ 
                  var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[0,0],board);
                  return c.usrCoords[1];
                },
                function(){ 
                  var c = new JXG.Coords(JXG.COORDS_BY_SCREEN,[board.canvasWidth,0],board);
                  return c.usrCoords[1];
                }
              ],{name:txtraw, withLabel:true});
  var q = board.create('glider', [2, 1, curve], {withLabel:false});
  var t = board.create('text', [
          function(){ return q.X()+0.1; },
          function(){ return q.Y()+0.1; },
          function(){ return "The slope of the function f(x)=" + txtraw + "<br>at x=" + q.X().toFixed(2) + " is equal to " + (JXG.Math.Numerics.D(f))(q.X()).toFixed(2); }
      ], 
      {fontSize:15});
};
    
    var y_init1 = function(x) {
        return Math.cos(2*Math.PI*x);
    };
    
    var noise = function() {
        return Math.random()*0.2; // noise in [0, 0.2)
    };
    
    var values = function (n) {  // array of X with noise
        var val = new Array ();
        for (var i=0; i<n; i++)
            val[i] = Math.random() + noise();
        return val;
    };
    
    var polinom = function (x, w, M) {  // w is array
        var res = 0;
        for (var i=0; i<=M; i++)
            res += w[i]*Math.pow(x, i);
    };

    $('#btn-submit').on('click', function(e) {
        e.preventDefault(); 
        var y_init = $("input[name='func-init']:checked").attr('val'); 
        var n = Number($('#points').val());
        var M = Number($('#polinom').val());
        var x = values(n); // array of X with noise
        
        var A = new Array (n);
        for(var i = 0; i < n; i++)
          A[i] = new Array(M+1);

        for (var i=0; i<n; i++)
            for (var j=0; j<=M; j++)
                A[i][j] = Math.pow(x[i], j);
        console.log(A);
        if (y_init=='cos(2*PI*x)') {
            var y = new Array (M+1);    
            for (var i=0; i<=M; i++) 
                y[i] = Array(n);
            
            for (var i=0; i<=M; i++) 
                y[i][0] = y_init1( x[i] );
            for (var i=1; i<=M; i++)
                for (var j=0; j<n; j++)
                    y[i][j] = 0;
        }
        
        if (y_init=='func-init2') {
            var y = new Array (n);    
            for (var i=0; i<n; i++) 
                y[i] = y_init2( x[i] );
        }
        
        if (y_init=='func-init3') {
            var y = new Array (n);    
            for (var i=0; i<n; i++) 
                y[i] = y_init3( x[i] );
        }
       
        var At = transposeMatrix(A);
        var AA = matrixMultiply(inverseMatrix(matrixMultiply(At,A)),At)
        var w = matrixMultiply(AA,y);
        
       //var w = Gauss(A, y, M, n); 
            
       var res = '';
       for (var i=0; i<=M; i++)
          res += w[i][0]+'*x^'+i+'+';
       $('.res').text('Polinom f(x,w) = '+res.slice(0, -1));
        
        plotter(y_init);
        plotter(res.slice(0, -1));
        
        
    });
   
});
    

var add = function (a, b) {
    var len = a.length;
    var c = new Array (len);
    for (var i = 0; i < len; ++i)
        c[i] = a[i] + b[i];
    return c;
};

var mult = function (a, k) {
    var len = a.length;
    var c = new Array (len);
    for (var i = 0; i < len; ++i)
        c[i] = a[i] * k;
    return c;
};


var Gauss = function(a, b, M, n) {
    /* Прямой ход метода Гаусса */

    var jj = [];
    var j = 0, r = 0;
    for (var i = 0; i < n; ++i) {
        var max_abs, k_max;
        while (j <= M) {
            //находим максимальный по модулю элемент
            max_abs = 0;
            k_max = i;
            for (var k = i; k < n; ++k) {
                if (Math.abs(a[k][j]) > max_abs) {
                    max_abs = Math.abs(a[k][j]);
                    k_max = k;
                }
            }
            if (max_abs != 0)
                break;
            ++j;
        }
        if (j > M)
            break;
        ++r;
        jj.push(j);
        if (k_max != i) {
            //поменять местами i-ю строчку с k_max-й
            for (var l = j; l < M+1; ++l) {
                var tmp = a[i][l];
                a[i][l] = a[k_max][l];
                a[k_max][l] = tmp;
            }
            var tmp = b[i];
            b[i] = b[k_max];
            b[k_max] = tmp;
        }
        //делим i-е уравнение на a[i][j]
        for (var l = j+1; l < M+1; ++l) {
            a[i][l] /= a[i][j];
        } console.log(a[i][j]); console.log(b[i]);
        b[i] /= a[i][j];
        a[i][j] = 1;
        //путём элементарных преобразований обнулить
    //элементы a[i+1][j], a[i+2][j], ..., a[m-1][j]
        for (var k = i+1; k < n; ++k) {
            //умножаем i-е уравнение на a[k][j]
    //и вычитаем из k-го уравнения
            for (var l = j+1; l < M+1; ++l)
                a[k][l] -= a[i][l]*a[k][j];
            b[k] -= b[i]*a[k][j];
            a[k][j] = 0;
        }
        ++j;
    }
    
    /* Проверка системы на совместность */

    var flag = true;
    for (var i = r; i < n; ++i) {
        if (b[i] != 0) {
            flag = false;
            return 'система несовместна';
        }
    }
  
    /* Определение свободных переменных */

    var free_vars_count = M+1-r;
    var ans = new Array(M+1);
    for (var j = 0; j < M+1; ++j)
        ans[j] = new Array(free_vars_count + 1);
    if (r === 0) {
        for (var j = 0; j < M+1; ++j)
            ans[j][j+1] = 1;
    }
    else {
        var c = 0;
        for (var j = 0; j < jj[0]; ++j) {
            ++c;
            ans[j][c] = 1;
        }
        for (var i = 0; i < r-1; ++i) {
            for (var j = jj[i]+1; j < jj[i+1]; ++j) {
                ++c;
                ans[j][c] = 1;
            }
        }
        for (var j = jj[r-1]+1; j < M+1; ++j) {
            ++c;
            ans[j][c] = 1;
        }
    }
    
    /* Обратный ход метода Гаусса */

    for (var i = r-1; i >= 0; --i) {
        ans[jj[i]][0] = b[i];
        for (j = jj[i]+1; j < n; ++j)
            ans[jj[i]] = add(ans[jj[i]], mult(ans[j], -a[i][j]));
    }
    return ans;
};    



 

    
    
    
    
    
    
    
    
    
    