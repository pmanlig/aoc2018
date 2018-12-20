#include <stdio.h>
#include <time.h>
#define NUM_MAPS 500

char map[NUM_MAPS][50][51];
int mins, scores[NUM_MAPS];

char count(char f, char (*b)[50][51], int r, int c) {
    char cnt=0;
    int fr = r==0?0:r-1, tr = r==49?49:r+1;
    int fc = c==0?0:c-1, tc = c==49?49:c+1;
    for (int i=fr; i<=tr; i++)
        for (int j=fc; j<=tc; j++)
            if ((i!=r || j!=c) && (*b)[i][j]==f) cnt++;
    return cnt;
}

char calc(char (*b)[50][51], int r, int c) {
    char o=(*b)[r][c];
    if (o=='.' && count('|',b,r,c)>2) return '|';
    if (o=='|' && count('#',b,r,c)>2) return '#';
    if (o=='#' && (count('#',b,r,c)==0 || count('|',b,r,c)==0)) return '.';
    return o;
}

void tick() {
    char (*a)[50][51], (*b)[50][51];
    b=&(map[mins%NUM_MAPS]);
    a=&(map[(mins+1)%NUM_MAPS]);
    for (int r=0; r<50; r++) {
        for (int c=0; c<50; c++) {
            (*a)[r][c] = calc(b, r, c);
        }
        (*a)[r][50]=0;
    }
}

int score(int min) {
    int w=0, l=0;
    for (int r=0; r<50; r++)
        for (int c=0; c<50; c++) {
            if ('|' == map[min%NUM_MAPS][r][c]) w++;
            if ('#' == map[min%NUM_MAPS][r][c]) l++;
        }
    return w*l;
}

void main() {
    char b, r=0, c;
    int lines=1, period=0;
    while (r < 50 && !feof(stdin)) {
        for (c=0; c<50; c++)
            map[0][r][c]=getchar();
        map[0][r][50]=0;
        r++;
        do { b=getchar(); } while (b!='\n' && !feof(stdin));
        if ('\n'==b) lines++;
    }
    // for (r=0; r<50; r++) printf("%s\n",map[r]);
    for (mins=0; mins<=1000000000; mins++) {
        tick();
        scores[mins%NUM_MAPS] = score(mins);
        for (int s=(mins%NUM_MAPS)-1; 2*s>mins%NUM_MAPS; s--) {
            if (scores[s]==scores[mins%NUM_MAPS] && scores[s]==scores[2*s-mins%NUM_MAPS]) {
                period = (mins%NUM_MAPS)-s;
                break;
            }
        }
        if (period > 0) break;
        printf("Min: %d, score: %d\n", mins, scores[mins%NUM_MAPS]);
        // if (mins%10000==0) printf("%d\n",mins);
        // for (r=0; r<50; r++) printf("%s\n",map[r]);
    }
    // for (r=0; r<50; r++) printf("%s\n",map[(mins-1)%NUM_MAPS][r]);
    printf("%d lines of input read\n", lines);
    if (period > 0) {
        int ex = mins;
        printf("Period of %d detected after %d iterations\n", period, mins);
        while (ex < 1000000000) ex+=period;
        printf("Extrapolated answer: %d\n", scores[(mins-(ex-1000000000))%NUM_MAPS]);
    }
    printf("Final score after %d mins: %d\n",mins-1,score(mins-1));
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}