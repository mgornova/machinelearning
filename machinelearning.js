$(document).ready( function() {
    
/*********************** GRAPH ***********************/
    var board = JXG.JSXGraph.initBoard('box', {boundingbox:[-1,12,2,-3], axis:true});
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
/**********************************************************/
    
    
    var y_init1 = function(x) {
        return Math.cos(2*Math.PI*x);
    };
    
    var y_init2 = function(x) {
        return 5*Math.pow(x,3)+Math.pow(x,2)+5;
    };
    
    var y_init3 = function(x) {
        return x*Math.sin(2*Math.PI*x);
    };
    
    var noise = function() {
        var res = 0;
        var tmp = new Array (12);
        for (var j=0; j<12; j++) {
            tmp[j] = Math.random();
            res += tmp[j];
        }
            res = 0.0001*(res-6)+0.01;
        
        return res; // noise in [0, 0.2) with normal distribution N(0.01,0.01)
    };
    
    var values = function (n) {  // array of X in ascending order 
        var val = new Array (n);
        for (var i=0; i<n; i++)
            val[i] = Math.random();
    
        return val.sort(function(a,b){return a - b});
    };
    
    var polinom = function (x/*array 1 element*/, w/*array*/, M) {  
        var res = 0; 
        for (var i=0; i<=M; i++)
            res += w[i]*Math.pow(x[0], i);
        return res;
    };
    
    var sum = function (x/*array*/, n) { //sum X of degree n
        var res = 0; 
        var len = x.length;
        for (var i=0; i<len; i++)
            res += Math.pow(x[i], n);
        return res;
    }
    
    /****************************************************/

    $('#btn-submit').on('click', function(e) {
        e.preventDefault(); 
        var y_init = $("input[name='func-init']:checked").attr('val'); 
        var n = Number($('#points').val());
        var M = Number($('#polinom').val())+1;
        var x = values(n); 
        var w = new Array(M);
        var b = new Array(M); // right part
                
        var A = new Array (M);
        for(var i = 0; i < M; i++)
          A[i] = new Array(M);

        
        for (var i=0; i<M; i++)
            for (var j=0; j<M; j++)
                A[i][j] = sum(x, i+j);
//console.log('*** A = ', A);
        var A_1 = InverseMatrix2(A);
//console.log('*** A_1 = ', A_1);
//console.log('*** A*A_1 = ', matrixMultiply(A,A_1));        
        if (y_init=='cos(2*PI*x)') {
            var y = new Array (n);    
            
            for (var i=0; i<n; i++) 
                y[i] = y_init1( x[i] ) + noise();
        } 
        
        if (y_init=='5*x^3+x^2+5') {
            var y = new Array (n);    
           
            for (var i=0; i<n; i++) 
                y[i] = y_init2( x[i] ) + noise();
        }
        
        if (y_init=='x*sin(2*PI*x)') {
            var y = new Array (n);    
           
            for (var i=0; i<n; i++) 
                y[i] = y_init3( x[i] ) + noise();
        }
        
        for(var i = 0; i < M; i++) {
            b[i] = 0;
            for(var j = 0; j < n; j++)
                b[i] += Math.pow(x[j], i)*y[j];
        }
       //console.log('**** b = ', b);
       w = MultMatrVect(A_1, b, M);  //console.log('****', w);
            
       var res = '';
       for (var i=0; i<M; i++)
          res += w[i]+'*x^'+i+'+';
       $('.res').text('Polinom f(x,w) = '+res.slice(0, -1));
        $('.array-x').text('Array of X : '+ x);
        
        plotter(y_init, {strokecolor:'black'});
        plotter(res.slice(0, -1));
        
        
        /******************** Cross Validation **************************/
        var tbl = "<table border=1>";
        var E = new Array (8);
        for (var i=0; i<8; i++) 
            E[i] = new Array (n);
        
        for (var Mi=2; Mi<=9; Mi++) {
console.log('****** Степень полинома ******', Mi);
            tbl += "<tr>"; 
            for (var k=0; k<n; k++) {
              
                var xi = new Array (n);
                var b2 = new Array (Mi+1);
                for (var j=0; j<n; j++) 
                    xi[j]= x[j];

                var cut = xi.splice(k,1); 
                
                var A2 = new Array (Mi+1);
                for(var i = 0; i <= Mi; i++)
                  A2[i] = new Array(Mi+1);
       
                for (var i=0; i<=Mi; i++)
                    for (var j=0; j<=Mi; j++)
                        A2[i][j] = sum(xi, i+j); console.log('** A2 = ', A2);
                var A2_1 = InverseMatrix2(A2); console.log('** A2_1 = ', A2_1);
       
                if (y_init=='cos(2*PI*x)') {
                    var y3 = new Array (n-1);    
            
                    for (var i=0; i<n-1; i++) 
                        y3[i] = y_init1( xi[i] ) + noise();
                  
                    var y_cut = y_init1( cut[0] ); 
                } 
                
                if (y_init=='5*x^3+x^2+5') {
                    var y3 = new Array (n-1);    
            
                    for (var i=0; i<n-1; i++) 
                        y3[i] = y_init1( xi[i] ) + noise();
                    
                    var y_cut = y_init2( cut[0] );
                }
                
                if (y_init=='x*sin(2*PI*x)') {
                    var y3 = new Array (n-1);    
            
                    for (var i=0; i<n-1; i++) 
                        y3[i] = y_init1( xi[i] ) + noise();
                    
                    var y_cut = y_init3( cut[0] );
                }

                for(var i = 0; i <= Mi; i++) {
                    b2[i] = 0;
                    for(var j = 0; j < n-1; j++)
                        b2[i] += Math.pow(xi[j], i)*y[j];
                } console.log('** b = ', b);
                var wi = MultMatrVect(A2_1, b2, Mi+1); console.log('**** wi = ', wi);
               
                E[Mi-2][k] = ( polinom(cut,wi,Mi)-y_cut )*( polinom(cut,wi,Mi)-y_cut ); 
                 tbl += "<td> E["+ Mi +"]["+k+"] " + E[Mi-2][k] + "</td>";
            }
            tbl += "</tr>";  
        }
        tbl += "</table>"; 
        
        var htm = '', 
            htm2 = '';
        var Emiddle = new Array(n),
            Emin = new Array(8);
        
        for (var Mi=2; Mi<=9; Mi++) {
            Emiddle[Mi-2] = 0;
            for (var k=0; k<n; k++) {
                Emiddle[Mi-2] += E[Mi-2][k];
            }
            Emiddle[Mi-2] /= n;
            htm += "<p> Emiddle["+Mi+"] "+ Emiddle[Mi-2] + "</p>";
        console.log('Mi', Mi);
            E[Mi-2] = E[Mi-2].sort(function(a,b){return a - b});
            Emin[Mi-2] = E[Mi-2][0]; console.log('Emin', Emin[Mi-2]);
        }
        Emin = Emin.sort(function(a,b){return a - b});
        
        $(".cv").html(tbl);
        $(".cv_res1").html(htm);
        $(".cv_res2").html("<p>E minimum = "+Emin[0]+"</p>");      
        /****************************************************************/
        
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
        } 
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



 

    
    
    
    
    
    
    
    
    
    