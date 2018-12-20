#include <stdio.h>
#include <string.h>

int time[366][61];
int guards[100][62];

int y,m,d,h,i,g;
char b, buf[50];
int mi=180, ma=180;

void init() {
    for (int i=0; i < 366; i++)
        for (int j=0; j < 61; time[i][j++]=0);
    for (int p=0; p < 100; p++)
        for (int q=0; q < 62; guards[p][q++]=0);
}

int day(int m, int d) {
    int days[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    for (int i=1; i < m; i++) d += days[i];
    return d;
}

int addGuard(int g) {
    for (int i=0; i < 100; i++) {
        if (guards[i][60]==0) guards[i][60]=g;
        if (guards[i][60]==g) i=100;
    }
}

int calc() {
    int last = 0;
    for (int i=0; i < 366; i++)
        for (int j=0; j < 60; j++) {
            if (time[i][j]==2) last=0;
            if (time[i][j]==1) last=1;
            time[i][j]=last;
        }
}

void sched() {
    for (int i=0; i < 366; i++) {
        if (time[i][60] != 0) {
            printf("Day %d: ", i);
            for (int j=0; j < 60; j++) {
                putchar(time[i][j]==0?'.':'#');
            }
            putchar('\n');
        }
    }
}

void collate() {
    int g;
    for (int i=0; i < 366; i++) {
        for (int j=0; j < 100; j++) {
            if (guards[j][60] == time[i][60])
                for (int p=0; p < 60; p++)
                    if (time[i][p]) guards[j][p]++;
        }
    }
}

void summary() {
    int max=0, guard, min;
    int mins;
    for (int i=0; i<100; i++) {
        if (guards[i][60]!=0) {
            mins=0;
            for (int j=0; j < 60; j++) mins += guards[i][j];
            printf("Guard #%d: %d mins\n", guards[i][60], mins);
            if (mins > max) {
                max = mins;
                guard = guards[i][60];
            }
        }
    }
    printf("Guard #%d is asleep the most, a total of %d mins\n", guard, max);
    for (int x=0; x < 100; x++) {
        if (guards[x][60] == guard) {
            max=0;
            for (int q=0; q<60; q++) {
                if (guards[x][q] > max) {
                    max = guards[x][q];
                    min = q;
                }
            }
            printf("Guard #%d is asleep the most on minute %d (%dx%d=%d)\n", guard, min, guard, min, guard*min);
        }
    }
}

void summary2() {
    int max=0, g=0, m=0; 
    for (int i=0; i<100; i++) {
        for (int j=0; j<60; j++) {
            if (guards[i][j]>max) {
                max = guards[i][j];
                g=guards[i][60];
                m=j;
            }
        }
    }
    printf("Guard #%d is asleep the most frequently on minute %d (%d times) (%d x %d = %d)\n", g,m,max,g,m,g*m);
}

void main() {
    init();
    while (!feof(stdin)) {
        scanf("%c%d%c%d%c%d %d%c%d%c %s ", &b,&y,&b,&m,&b,&d,&h,&b,&i,&b,buf);
        d = day(m,d);
        if (h==23) d++;
        if (strcmp(buf,"Guard")==0) {
            scanf("%c%d ", &b,&g);
            time[d][60]=g;
            addGuard(g);
        }
        if (strcmp(buf,"wakes")==0) time[d][i] = 2;
        if (strcmp(buf,"falls")==0) time[d][i] = 1;
        while (!feof(stdin) && b != '\n') b = fgetc(stdin);
        // if (h != 23 && h != 0) printf("ERROR! Hour is %d\n", h);
        // printf("%d-%d-%d %s\n", y, m, d, buf);
    }
    calc();
    // sched();
    collate();
    summary();
    summary2();
    for (int i=0;i<100;i++) {
        if (guards[i][60] != 0) {
            // printf("Guard id %d\n", guards[i]);
        } else {
            printf("%d guards\n", i);
            i=100;
        }
    }
    printf("Min: %d\nMax: %d\n", mi, ma);
}