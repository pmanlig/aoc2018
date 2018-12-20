#include <stdio.h>
#include <unistd.h>
#include <time.h>
#define LINES 11
#define ROWS 80

char buf[20], b;
long pts[500][4];
int cnt;
char msg[LINES][ROWS];
long ticks=0;

void tick() {
    ticks++;
    for (int i=0; i<cnt; i++) {
        pts[i][0]+=pts[i][2];
        pts[i][1]+=pts[i][3];
    }
}

long sizeX() {
    long minx=pts[0][0], maxx=pts[0][0];
    for (int i=1; i<cnt; i++) {
        if (pts[i][0]<minx) minx=pts[i][0];
        if (pts[i][0]>maxx) maxx=pts[i][0];
    }
    return maxx-minx;
}

void find() {
    int lim=30000, i=0;
    tick();
    while (i<lim && sizeX()>ROWS) {
        tick();
        i++;
    }
}

void print() {
    long minx=pts[0][0], miny=pts[0][1];
    for (int i=1; i<cnt; i++) {
        if (pts[i][0]<minx) minx=pts[i][0];
        if (pts[i][1]<miny) miny=pts[i][1];
    }
    for (int i=0; i<LINES; i++)
        for (int j=0; j<ROWS; j++)
            msg[i][j] = '.';
    for (int i=0; i<cnt; i++) {
        long x=pts[i][0]-minx;
        long y=pts[i][1]-miny;
        if (x>-1 && x<ROWS && y>-1 && y<LINES)
            msg[y][x] = '#';
    }
    for (int i=0; i<LINES; i++) {
        for (int j=0; j<ROWS; j++)
            putchar(msg[i][j]);
        printf("\n");
    }
}

void opt() {
    long min=pts[0][1], max=pts[0][1];
    long minv=pts[0][3], maxv=pts[0][3];
    for (int i=0; i<cnt; i++) {
        if (pts[i][1]<min) {
            min = pts[i][1];
            minv = pts[i][3];
        }
        if (pts[i][1]>max) {
            max = pts[i][1];
            maxv = pts[i][3];
        }
    }
    max-=min+2*LINES;
    minv-=maxv;
    min=max/minv;
    ticks+=min;
    for (int i=0; i<cnt; i++) {
        pts[i][0]+=min*pts[i][2];
        pts[i][1]+=min*pts[i][3];
    }
    printf("Skipping %ld ticks\n", min);
}

void main() {
    long p, x;
    while (!feof(stdin)) {
        scanf("%10s %ld%c %ld%c %10s %ld%c %ld%c", buf, &pts[cnt][0], &b, &pts[cnt][1], &b, buf, &pts[cnt][2], &b, &pts[cnt][3], &b);
        while (!feof(stdin) && b!='\n') b=getchar();
        cnt++;
    }
    printf("Lines: %d\n", cnt);
    opt();
    do {
        p=sizeX();
        find();
        x=sizeX();
        if (x < p) {
            printf("\e[1;1H\e[2JTick: %ld\n", ticks);
            printf("X: %ld, y: %ld\n", pts[0][0], pts[0][1]);
            print();
            sleep(1);
        }
    } while (p>=x);
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}