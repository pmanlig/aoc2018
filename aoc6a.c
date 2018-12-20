#include <stdio.h>
#include <time.h>

// int map[320][320];
int coord[50][5], count=0;

void calc() {
    printf("%d coordinates\n\n", count);
    for (int i=0; i<count; i++) coord[i][4]=0;
    int min, dx, dy, c, ci, b=0, tot;
    for (int x=0; x<320; x++)
        for (int y=0; y<320; y++) {
            min=1000;
            tot=0;
            for (int i=0; i<count; i++) {
                dx = x-coord[i][0];
                if (dx < 0) dx=-dx;
                dy = y-coord[i][1];
                if (dy < 0) dy=-dy;
                if (dx+dy<min) {
                    min=dx+dy;
                    ci = i;
                    c=coord[i][2];
                } else if (dx+dy==min) {
                    ci = -1;
                    c='.';
                }
                tot+=dx;
                tot+=dy;
                // if (x < 5 && y > 20 && y < 25)
                //     printf("(%d, %d) - (%d, %d) = %d (%c)\n", x, y, coord[i][0], coord[i][1], dx+dy, c);
            }
            if (tot<10000) b++;
            if (x == 0 || x == 319 || y == 0 || y == 319)
                coord[ci][4]=-1;
            if (coord[ci][4] != -1)
                coord[ci][4]++;
            // map[x][y] = ci;
            // if (min==0) map[x][y]='+';
        }
    min=0;
    for (int i=0;i<count;i++)
        if (coord[i][4]>min) min=coord[i][4];
    printf("Largest: %d\n", min);
    printf("Size of safe: %d\n", b);
}

/*
void print() {
    for (int x=0; x < 80; x++) {
        for (int y=0; y < 80; y++) {
            putchar(map[x][y]==-1?'.':coord[map[x][y]][2]);
        }
        putchar('\n');
    }
}

void sum() {
    int max=0;
    for (int i=0; i < count; i++) coord[i][3]=0;
    for (int x=0; x<320; x++)
        for (int y=0; y<320; y++) {
            if (map[x][y]!=-1) coord[map[x][y]][3]++;
        }
    for (int x=0; x < 320; x++) {
        coord[map[x][0]][3]=0;
        coord[map[x][319]][3]=0;
    }
    for (int y=0; y < 320; y++) {
        coord[map[0][y]][3]=0;
        coord[map[319][y]][3]=0;
    }
    for (int i=0; i < count; i++) if (coord[i][3]>max) max=coord[i][3];
    printf("Max size: %d\n", max+1);
}
*/

void main() {
    char b, c='a';
    int maxx, maxy, minx, miny, x, y;
    while (!feof(stdin)) {
        scanf("%d%c %d ", &x, &b, &y);
        // printf("Read: %d, %d\n", x, y);
        if (count==0) {
            maxx=x;
            minx=x;
            maxy=y;
            maxy=y;
        } else {
            if (x > maxx) maxx=x;
            if (x < minx) minx=x;
            if (y > maxy) maxy=y;
            if (y < miny) miny=y;
        }
        coord[count][0] = x-40;
        coord[count][1] = y-40;
        coord[count][2] = c++;
        count++;
        if (c > 'z') c = 'A';
    }
    // printf("%d coordinates\nMin: %d, %d\nMax: %d, %d\n", i, minx, miny, maxx, maxy);
    calc();
    // print();
    // sum();
    printf("%lf s\n",clock()/(double)CLOCKS_PER_SEC);
}