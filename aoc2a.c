#include <stdio.h>

void main() {
    int twice=0, thrice=0;
    int letters[256];
    char buf[50], *index;
    while (!feof(stdin)) {
        if (scanf("%s", buf) > 0) {
            for (int i=0; i<256; i++) letters[i]=0;
            index = buf;
            while(*index != 0) letters[*index++]++;
            for (int i=0; i<256; i++) if (letters[i]==2) {twice++; break;}
            for (int i=0; i<256; i++) if (letters[i]==3) {thrice++; break;}
        }
    }

    printf("%d x %d = %d\n", twice, thrice, twice*thrice);
}