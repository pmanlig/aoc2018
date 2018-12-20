#include <stdio.h>
#include <time.h>

void main() {
    char b;
    int lines=1;
    while (!feof(stdin)) {
        b=getchar();
        if ('\n'==b) lines++;
    }
    printf("%d lines of input read\n", lines);
    printf("Time to complete: %lfs\n",clock()/(double)CLOCKS_PER_SEC);
}