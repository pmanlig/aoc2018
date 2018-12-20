#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#define NORTH 0
#define WEST 1
#define EAST 2
#define SOUTH 3
#define X 4
#define Y 5
#define DISTANCE 6

int rooms[10000][7], cnt=0, paths=0, stack[100][3], sp=0, dx[4] = {0,-2,2,0}, dy[4] = {-2,0,0,2}, rev[4] = {SOUTH, EAST, WEST, NORTH};

int addRoom(int x, int y) {
    // ToDo: Add door to go back
    rooms[cnt][X]=x;
    rooms[cnt][Y]=y;
    rooms[cnt][NORTH]=-1;
    rooms[cnt][WEST]=-1;
    rooms[cnt][EAST]=-1;
    rooms[cnt][SOUTH]=-1;
    rooms[cnt][DISTANCE]=-1;
    return cnt++;
}

void push(int x, int y, int r) {
    stack[sp][0] = x;
    stack[sp][1] = y;
    stack[sp++][2] = r;
}

void pop(int *x, int *y, int *r) {
    *x = stack[--sp][0];
    *y = stack[sp][1];
    *r = stack[sp][2];
}

int findRoom(int x, int y) {
   for (int i=0; i<cnt; i++) {
       if (x==rooms[i][X] && y==rooms[i][Y]) return i;
   }
   return addRoom(x,y);
}

void move(int *x, int *y, int *r, int dir) {
    int old = *r;
    (*x)+=dx[dir];
    (*y)+=dy[dir];
    *r = findRoom(*x,*y);
    rooms[old][dir] = *r;
    rooms[*r][rev[dir]] = old;
}

void readPath() {
    char b=0;
    while (!feof(stdin) && '^'!=b) { b=getchar(); }
    if ('^'==b) {
        int x=0, y=0, r=findRoom(0,0);
        while (!feof(stdin) && '$'!=b) {
            b=getchar();
            if ('$'==b) paths++;
            if ('N'==b) move(&x,&y,&r,NORTH);
            if ('W'==b) move(&x,&y,&r,WEST);
            if ('E'==b) move(&x,&y,&r,EAST);
            if ('S'==b) move(&x,&y,&r,SOUTH);
            if ('('==b) push(x,y,r);
            if ('|'==b) { pop(&x,&y,&r); push(x,y,r); }
            if (')'==b) pop(&x,&y,&r);
        }
    }
}

void output() {
    int minx=0, maxx=0, miny=0, maxy=0;
    for (int i=0; i<cnt; i++) {
        if (rooms[i][X] < minx) minx = rooms[i][X];
        if (rooms[i][X] > maxx) maxx = rooms[i][X];
        if (rooms[i][Y] < miny) miny = rooms[i][Y];
        if (rooms[i][Y] > maxy) maxy = rooms[i][Y];
    }
    minx--;
    miny--;
    maxx+=2;
    maxy+=2;
    // Debug
    /*
    minx=-100;
    maxx=minx+200;
    miny=-100;
    maxy=miny+200;
    */
    int rows = maxy-miny, cols = maxx-minx;
    char map[rows][cols+1];
    for (int r=0; r<rows; r++) {
        for (int c=0; c<cols; c++)
            map[r][c] = '#';
        map[r][cols] = 0;
    }
    printf("Calculate map\n");
    for (int i=0; i<cnt; i++) {
        map[rooms[i][Y]-miny][rooms[i][X]-minx] = '.';
        if (-1 < rooms[i][NORTH]) map[rooms[i][Y]-miny-1][rooms[i][X]-minx] = '-';
        if (-1 < rooms[i][SOUTH]) map[rooms[i][Y]-miny+1][rooms[i][X]-minx] = '-';
        if (-1 < rooms[i][WEST]) map[rooms[i][Y]-miny][rooms[i][X]-minx-1] = '|';
        if (-1 < rooms[i][EAST]) map[rooms[i][Y]-miny][rooms[i][X]-minx+1] = '|';
    }
    map[rooms[0][Y]-miny][rooms[0][X]-minx] = 'X';
    printf("Calculated map\n");
    printf("X: %d - %d, Y: %d - %d, Rows: %d, Cols: %d\n", minx, maxx, miny, maxy, rows, cols);
    for (int r=0; r<rows; r++) printf("%3d: %.120s\n", r, &map[r][140]);
}

void path(int r, int d) {
    if (-1 == rooms[r][DISTANCE] || d < rooms[r][DISTANCE]) {
        rooms[r][DISTANCE] = d++;
        for (int i=NORTH; i<=SOUTH; i++)
            if (-1 < rooms[r][i]) path(rooms[r][i], d);
    }
}

void findMax() {
    int max=0, num=0;
    for (int i=0; i<cnt; i++) {
        if (rooms[i][DISTANCE]>max) max=rooms[i][DISTANCE];
        if (rooms[i][DISTANCE]>999) num++;
    }
    printf("Longest distance: %d, # >999: %d\n", max, num);
}

void main() {
    char b;
    while (!feof(stdin)) {
        readPath();
    }
    // output();
    path(0,0);
    findMax();
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}