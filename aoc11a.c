#include <stdio.h>
#include <time.h>

int g[301][301][301];
int m, mx, my, ms;

int pwr(int x, int y, int s) {
    int rID, p;
    rID = x+10;
    p = rID*y+s;
    p *= rID;
    p = (p%1000)/100;
    if (p == 10) p=0;
    p -= 5;
    return p;
}

int valD(int x, int y, int s) {
    int v=0;
    for (int d=s/2; d>0; d--) {
        if (s%d==0) {
            for (int i=x; i<x+s; i+=d)
                for (int j=y; j<y+s; j+=d)
                    v+=g[d][i][j];
            g[s][x][y]=v;
            return v;
        }
    }
    for (int i=x; i<x+s; i++)
        for (int j=y; j<y+s; j++)
            v+=g[1][i][j];
    g[s][x][y]=v;
    return v;
}

int valA(int x, int y, int s) {
    int v=g[s-1][x][y];
    for (int i=x; i<x+s; i++)
        v+=g[1][i][y+s-1];
    for (int j=y; j<y+s-1; j++)
        v+=g[1][x+s-1][j];
    g[s][x][y]=v;
    return v;
}

void calc(int serial) {
    for (int x=1; x<301; x++)
        for (int y=1; y<301; y++)
            g[1][x][y]=pwr(x,y,serial);
}

void findMaxC(int size) {
    int u = 302-size;
    for (int x=1; x<u; x++)
        for (int y=1; y<u; y++)
            if (valA(x,y,size) > m) {
                mx=x;
                my=y;
                ms=size;
                m=valA(x,y,size);
            }
}

void findMax() {
    for (int x=1; x<301; x++)
        for (int y=1; y<301; y++) {
            int v=0;
            for (int s=0; s+x<301 && s+y<301; s++) {
                for (int i=0; i<s+1; i++)
                    v+=g[1][x+i][y+s];
                for (int i=0; i<s; i++)
                    v+=g[1][x+s][y+i];
                if (v>m) {
                    m=v;
                    mx=x;
                    my=y;
                    ms=s+1;
                }
            }
        }
}

void test(int x, int y, int s, int r) {
    int p = pwr(x, y, s);
    printf("<%d, %d> @%d = %d...%s\n", x, y, s, p, p==r?"OK":"Error");
}

void main() {
    /*
    test(3,5,8,4);
    test(122,79,57,-5);
    test(217,196,39,0);
    test(101,153,71,4);
    */
    calc(7315);
    m=0;
    /*
    for (int s=2; s<301; s++)
    {
        printf("Calculating size %d...\n", s);
        findMaxC(s);
    }
    */
    findMax();
    printf("Max (%dx%d) @ <%d,%d,%d>: %d\n", ms, ms, mx, my, ms, m);
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}