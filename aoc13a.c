#include <stdio.h>
#include <time.h>
#define UP 0
#define DOWN 1
#define LEFT 2
#define RIGHT 3
#define CRASH 4

char cartSym[4] = "^v<>";
int left[4] = { LEFT, RIGHT, DOWN, UP };
int right[4] = { RIGHT, LEFT, UP, DOWN };
int dx[4] = { 0, 0, -1, 1 };
int dy[4] = { -1, 1, 0, 0 };
int cw[4] = { RIGHT, LEFT, DOWN, UP };
int ccw[4] = { LEFT, RIGHT, UP, DOWN };
char tracks[10] = "/\\-|+";
char cart[5] = ">^<v";
char t[200][200];
int carts[20][5], numCarts=0, numLines=0, numCols=0;
int crashPos[2] = { -1, -1 };

void init() {
    for (int i=0; i<200; i++)
        for (int j=0; j<200; j++)
            t[i][j] = 0;
    for (int i=0; i<20; i++)
        for (int j=0; j<4; j++)
            carts[i][j]=0;
}

void addCart(char c, int x, int y) {
    carts[numCarts][0]=x;
    carts[numCarts][1]=y;
    for (int i=0; i<4; i++)
        if (c==cartSym[i]) {
            carts[numCarts][2]=i;
            break;
        }
    carts[numCarts][3]=0;
    t[y][x]=(c=='<'||c=='>')?'-':'|';
    numCarts++;
}

void outputCarts() {
    for (int i=0; i<numCarts; i++)
        printf("%c Cart %d: %d, %d, %d, %d\n", CRASH == carts[i][2]?'X':' ', i, carts[i][0], carts[i][1], carts[i][2], carts[i][3]);
}

void outputTrack() {
    char n;
    for (int r=0; r<numLines; r++) {
        for (int c=0; c<numCols; c++) {
            n = t[r][c];
            for (int i=0; i<numCarts; i++)
                if (CRASH != carts[i][2] && c==carts[i][0] && r==carts[i][1])
                    n=cartSym[carts[i][2]];
            if (c==crashPos[0] && r==crashPos[1])
                n='X';
            putchar(n);
            // putchar(t[r][c]);
        }
        putchar('\n');
    }
}

void move(int i) {
    if (CRASH == carts[i][2]) return;
    carts[i][0]+=dx[carts[i][2]];
    carts[i][1]+=dy[carts[i][2]];
    char n=t[carts[i][1]][carts[i][0]];
    if ('/'==n) carts[i][2]=cw[carts[i][2]];
    if ('\\'==n) carts[i][2]=ccw[carts[i][2]];
    if ('+'==n) {
        if (0==carts[i][3]) {
            carts[i][3]++;
            carts[i][2]=left[carts[i][2]];
        } else if (1==carts[i][3]) {
            carts[i][3]++;
        } else if (2==carts[i][3]) {
            carts[i][3]=0;
            carts[i][2]=right[carts[i][2]];
        }
    }
}

int crash() {
    for (int i=0; i<numCarts; i++)
        for (int j=i+1; j<numCarts; j++)
            if (carts[i][0]==carts[j][0] && carts[i][1]==carts[j][1]) {
                crashPos[0] = carts[i][0];
                crashPos[1] = carts[i][1];
                return 1;
            }
    return 0;
}

void eliminateCrashed() {
    for (int i=0; i<numCarts; i++)
        if (CRASH != carts[i][2])
            for (int j=i+1; j<numCarts; j++)
                if (CRASH != carts[j][2] && carts[i][0]==carts[j][0] && carts[i][1]==carts[j][1]) {
                    carts[i][2] = CRASH;
                    carts[j][2] = CRASH;
                }
}

void eliminate(int j) {
    for (int i=0; i<numCarts; i++)
        if (i!=j && CRASH != carts[i][2] && carts[i][0]==carts[j][0] && carts[i][1]==carts[j][1]) {
            carts[i][2] = CRASH;
            carts[j][2] = CRASH;
        }
}

void tick() {
    /*
    for (int i=0; i<numCarts; i++) {
        move(i);
        eliminate(i);
    }
    */
    for (int i=0; i<numCarts; i++) carts[i][4]=1;
    for (int y=0; y<numLines; y++)
        for (int x=0; x<numCols; x++)
            for (int i=0; i<numCarts; i++)
                if (1==carts[i][4] && CRASH != carts[i][2] && carts[i][0]==x && carts[i][1]==y) {
                    carts[i][4]=0;
                    move(i);
                    eliminate(i);
                }
}

int cartsLeft() {
    int cnt = 0;
    for (int i=0; i<numCarts; i++) if (CRASH != carts[i][2]) cnt++;
    return cnt;
}

void main() {
    char b=0;
    int r=0, c=0;
    while (!feof(stdin)) {
        b=getchar();
        if (b=='>' || b=='<' || b=='^' || b=='v')
            addCart(b, c++, r);
        else if ('\n'==b) {
            numLines++;
            t[r++][c] = 0;
            if (c>numCols) numCols=c;
            c=0;
        } else {
            t[r][c++]=b;
        }
    }
    printf("%d lines of input read, maximum %d columns, %d carts\n", numLines, numCols, numCarts);
    int ticks=0;
    while (1 < cartsLeft()) {
    // while (!crash()) {
        tick();
        ticks++;
    }
    /*
    outputCarts();
    tick();
    ticks++;
    */

    outputTrack();
    outputCarts();
    if (crash()) printf("Crash at <%d, %d>\n", crashPos[0], crashPos[1]);
    printf("Ticks: %d\n", ticks);
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}