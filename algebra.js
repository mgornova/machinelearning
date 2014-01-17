// The MIT License

// Copyright (c) 2011 Pedro http://lamehacks.net

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


/*
Recursive implementation using laplace expansion
http://www.webcitation.org/61AGedZlm
*/
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


/*
http://en.wikipedia.org/wiki/Cofactor_(linear_algebra)
*/
function cofactor(m, k, l){
        minor = minorMatrix(m, k, l);
        return determinant(minor);
}

/*
http://en.wikipedia.org/wiki/Cofactor_(linear_algebra)#Matrix_of_cofactors
*/
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


/*
Used the adjoint method
http://www.webcitation.org/61BTRqAoZ
*/
function inverseMatrix(m){
        var det = determinant(m);
        if (det == 0) throw "SingularMatrix";
        var deti = 1 / det;
        var cof = cofactorMatrix(m);
        var adj = transposeMatrix(cof);
        var result = matrixScalarMultiply(adj,deti);
        return result;
}

/*
performs operation element by element between to matrices
*/
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


function Determinant2(A)   // Определитель матрицы (используется алгоритм Барейса)
{
    var N = A.length, B = [], denom = 1, exchanges = 0;
    for (var i = 0; i < N; ++i)
     { B[i] = [];
       for (var j = 0; j < N; ++j) B[i][j] = A[i][j];
     }
    for (var i = 0; i < N-1; ++i)
     { var maxN = i, maxValue = Math.abs(B[i][i]);
       for (var j = i+1; j < N; ++j)
        { var value = Math.abs(B[j][i]);
          if (value > maxValue){ maxN = j; maxValue = value; }
        }
       if (maxN > i)
        { var temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
          ++exchanges;
        }
       else { if (maxValue == 0) return maxValue; }
       var value1 = B[i][i];
       for (var j = i+1; j < N; ++j)
        { var value2 = B[j][i];
          B[j][i] = 0;
          for (var k = i+1; k < N; ++k) B[j][k] = (B[j][k]*value1-B[i][k]*value2)/denom;
        }
       denom = value1;
     }                                           //@ http://mathhelpplanet.com/viewtopic.php?f=44&t=22390
    if (exchanges%2) return -B[N-1][N-1];
    else return B[N-1][N-1];
}

function MatrixCofactor(i,j,A)   //Алгебраическое дополнение матрицы
{ 
    var N = A.length, sign = ((i+j)%2==0) ? 1 : -1;
    for (var m = 0; m < N; m++)
     { for (var n = j+1; n < N; n++) A[m][n-1] = A[m][n];
       A[m].length--;
     }
    for (var k = i+1; k < N; k++) A[k-1] = A[k];
    A.length--;
    return sign*Determinant2(A);
}

function AdjugateMatrix(A)      //Союзная (присоединённая) матрица
{
    var N = A.length, B = [], adjA = [];
    for (var i = 0; i < N; i++)
     { adjA[i] = []; 
       for (var j = 0; j < N; j++)
        { for (var m = 0; m < N; m++)
           { B[m] = [];
             for (var n = 0; n < N; n++) B[m][n] = A[m][n];
           }
          adjA[i][j] = MatrixCofactor(j,i,B);
        }
     }
    return adjA;
}

function InverseMatrix2(A)   // Обратная матрица
{   
    var det = Determinant2(A);
    if (det == 0) return false;
    var N = A.length, A = AdjugateMatrix(A);
    for (var i = 0; i < N; i++)
     { for (var j = 0; j<N; j++) A[i][j] /= det; }
    return A;
}

function MultMatrVect (A/*matrix*/, b/*vector*/, N) {
    var res = [];
    for (var i=0; i<N; i++) {
        res[i] = 0;
        for (var j = 0; j<N; j++) {
            res[i] += A[i][j]*b[j];
        }
    }
}