/*********************************************************
    ALGEBRA
**********************************************************/

function matrixMultiply(a,b){
        var btrans = transposeMatrix(b);
        var result = [];
        for(var i=0; i < a.length; i++){
                var row = [];
                for(var j=0; j < btrans.length; j++){
                        var value = internalProduct(a[i],btrans[j]);
                        row.push(value)
                }
                result.push(row);
        }
        return result;
}

function matrixScalarMultiply(m,s){
        var result = [];
        for(var i=0; i < m.length; i++){
                var row = [];
                for(var j=0; j < m[0].length; j++){
                        row.push(s * m[i][j]);
                }
                result.push(row);
        }
        return result;
}


//unnecessary - use dotOp instead
function matrixAdd(a,b){
        var result = [];
        for(var i=0; i < a.length; i++){
                var row = [];
                for(var j=0; j < a[0].length; j++){
                        row.push(a[i][j] + b[i][j]);
                }
                result.push(row);
        }
        return result;
}

//for internal usage only
function internalProduct(u,v){
        if (u.length != v.length) throw "SizesDoNotMatch";
        var sum = 0;
        for(var i=0; i < u.length; i++){
                sum += u[i]*v[i];
        }
        return sum;
}

function transposeMatrix(m){
        var t = [];
        for(var i=0; i < m[0].length; i++){
                var row = [];
                for(var j=0; j < m.length; j++){
                        row.push(m[j][i]);
                }
                t.push(row);
        }
        return t;
}

function minorMatrix(m, k, l){
        var reduced = [];
        for(var i=0; i < m.length; i++){
                if(i==k) continue;
                var row = [];
                for(var j=0; j < m.length; j++){
                        if(j==l) continue;
                        row.push(m[i][j])
                }
                reduced.push(row);
        }
        return reduced;
}

function determinant(m){
        var size = m.length;
        if(size == 1) return m[0][0];
        if(size == 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
        var det = 0;
        for(var i=0; i < size; i++){
                var minor = minorMatrix(m,0,i);
                var signal = (i%2 > 0) ? -1 : 1;
                det += signal * m[0][i]* determinant(minor);
        }
        return det;
}


function cofactor(m, k, l){
        minor = minorMatrix(m, k, l);
        return determinant(minor);
}


function cofactorMatrix(m){
        var cofactors = [];
        for(var i = 0; i < m.length; i++){
                var row = [];
                for(var j = 0; j < m.length; j++){
                        var cofactorval = cofactor(m,i,j);
                        row.push(cofactorval);
                }
                cofactors.push(row);
        }
        return cofactors;
}

function inverseMatrix(m){
        var det = determinant(m);
        if (det == 0) throw "SingularMatrix";
        var deti = 1 / det;
        var cof = cofactorMatrix(m);
        var adj = transposeMatrix(cof);
        var result = matrixScalarMultiply(adj,deti);
        return result;
}


function dotOp(func,m,n){
        var result = [];
        for(var i = 0; i < m.length; i++){
                var row = [];
                for(var j = 0; j < m[0].length; j++){
                        row.push(func(m[i][j], n[i][j]));
                }
                result.push(row);
        }
        return result;
}


function generateMatrix(nlines, ncols, func){
        var m = [];
        for(var i = 0; i < nlines; i++){
                var row = [];
                for(var j = 0; j < ncols; j++){
                        row.push(func(i,j));
                }
                m.push(row);
        }
        return m;
}

function zeros(nlines,ncols){
        return generateMatrix(nlines,ncols, function(i,j){return 0;});
}

function ones(nlines,ncols){
        return generateMatrix(nlines,ncols, function(i,j){return 1;});
}

function identity(size){
        return generateMatrix(size, size, function(i,j){ if(i===j) return 1; return 0; });
}

/**********************************************************************************************/


$(document).ready( function() {
    
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
        if (y_init=='func-init1') {
            var y = new Array (n);    
            for (var i=0; i<n; i++) 
                y[i] = y_init1( x[i] );
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
        
       var w = Gauss(A, y, M, n); 
            
       var res = '';
       for (var i=0; i<=M; i++)
          res += w[i][0]+'*x^'+i+'+';
       $('.res').text('Polinom f(x,w) = '+res.slice(0, -1));
        
        
    /*    switch (y_init) {
            case 'func-init1': 
                var y = new Array(); console.log('4!!!!!!!!!!!!');
                for (var i=0; i<=M; i++) 
                    y[i] = y_init1( x[i] );
                
                var Ai = inverseMatrix(A); console.log('5!!!!!!!!!!!!');
                var w = matrixMultiply(Ai,y); console.log(w);
                break;
                
            case 'func-init2':
                break;
                
            case 'func-init2':
                break;   
        }
        */
        
        /*var data = new Array(n);
        for (var i=0; i<n; i++)
            data[i] = [x[i], polinom(x[i], w, M)];
        
        var plot = $.plot($('.graph'), data)*/
        
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
    
    
    
    
    
    
    
    
    
    