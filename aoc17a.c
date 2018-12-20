#include <stdio.h>
#include <time.h>

int mud[200000][2],mudcnt=0,maxy=1,miny=2000,minx=500,maxx=500;
char map[1000][2000];

void interpret(char *c1, char *c2, int x1, int x2, int y1, int y2) {
    if ('y'==c1[0]) {
        interpret(c2, c1, y1, y2, x1, x2);
        return;
    }
    if (y1<miny) miny=y1;
    if (y2>maxy) maxy=y2;
    if (x1<minx) minx=x1;
    if (x2>maxx) maxx=x2;
    x2++;
    y2++;
    for (int x=x1; x<x2; x++)
        for (int y=y1; y<y2; y++) {
            mud[mudcnt][0] = x;
            mud[mudcnt++][1] = y;
            map[x][y]='#';
        }
}

void init() {
    for (int x=0; x<1000; x++)
        for (int y=0; y<2000; y++)
            map[x][y] = '.';
}

void fillDown(int x,int y);

int canDrop(char c) {
    return c=='.' || c=='|';
}

int overflow(int x, int y) {
    int x1 =x, x2 =x;
    while ('#' != map[x1-1][y] && !canDrop(map[x1][y+1])) x1--;
    while ('#' != map[x2+1][y] && !canDrop(map[x2][y+1])) x2++;
    char fill = (canDrop(map[x1][y+1]) || canDrop(map[x2][y+1])) ? '|' : '~';
    for (int i=x1; i<x2+1; i++) map[i][y]=fill;
    if (canDrop(map[x1][y+1])) fillDown(x1,y+1);
    if (canDrop(map[x2][y+1])) fillDown(x2,y+1);
    return fill == '~';
}

void fillDown(int x,int y) {
    while(y<=maxy && '.'==map[x][y]) {
        map[x][y] = '|';
        y++;
    }
    if ('#' == map[x][y] || '~' == map[x][y])
        do y--; while (overflow(x,y));
}

int calc(int x, int y, int *reach, int *retain) {
    fillDown(x,y+1);
    (*reach)=0;
    (*retain)=0;
    for (int x=0; x<1000; x++)
        for (int y=miny; y<=maxy; y++) {
            if ('|' == map[x][y] || '~' == map[x][y]) (*reach)++;
            if ('~' == map[x][y]) (*retain)++;
        }
    
    return *reach;
}

void output(int x1, int x2, int y1, int y2) {
    x2++;
    y2++;
    for (int y=y1; y<y2; y++) {
        printf("%4d: ",y);
        for (int x=x1; x<x2; x++)
            putchar(map[x][y]=='.'?' ':map[x][y]);
        putchar('\n');
    }
}

void main() {
    char b, c1[5], c2[5];
    int x, y1, y2;
    int lines=1;
    init();
    while (!feof(stdin)) {
        scanf("%2s%d%c %2s%d", c1, &x, &b, c2, &y1);
        if (feof(stdin)) break;
        b=getchar();
        if ('.'==b) {
            b=getchar();
            scanf("%d", &y2);
            interpret(c1, c2, x, x, y1, y2);
        } else interpret(c1, c2, x, x, y1, y1);
        while (!feof(stdin) && '\n'!=b) b=getchar();
        if ('\n'==b) lines++;
    }
    minx--;
    maxx++;
    // output(minx,maxx,miny,maxy);
    int reach,retain;
    calc(500,0,&reach,&retain);
    // output(minx,maxx,miny,maxy);
    printf("%d lines of input read\n", lines);
    printf("%d squares of mud found, depth %d..%d, spread %d..%d\n", mudcnt, miny, maxy, minx, maxx);
    printf("Water can reach %d squares, %d will be retained\n", reach, retain);
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}